import Busboy from 'busboy';
import { NextFunction, Request, Response } from "express";
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CustomError } from "../errors/CustomError";

interface FileData { filename: string, encoding: string, mimeType: string }
export interface CustomFile {
    fieldname: string
    name: string
    extension: string
    encoding: string
    mimetype: string
    type: string
    buffer: Buffer
    size: number
}

export const filesUpload = (req: Request, res: Response, next: NextFunction) => {
    try {
        // See https://cloud.google.com/functions/docs/writing/http#multipart_data
        const busboy = Busboy({
            headers: req.headers,
            limits: {
                // Cloud functions impose this restriction anyway
                fileSize: 10 * 1024 * 1024,
            },
        });

        const fields = {};
        const files: { [key: string]: CustomFile } = {};
        const fileWrites = [];
        // Note: os.tmpdir() points to an in-memory file system on GCF
        // Thus, any files in it must fit in the instance's memory.
        const tmpdir = os.tmpdir();
        busboy.on("field", (key, value) => {
            // You could do additional deserialization logic here, values will just be
            // strings
            fields[key] = value;
        });

        busboy.on("file", (fieldname, file, fileData: FileData) => {

            const filepath = path.join(tmpdir, fileData.filename);
            const writeStream = fs.createWriteStream(filepath);
            file.pipe(writeStream);

            fileWrites.push(
                new Promise<void>((resolve, reject) => {
                    file.on("end", () => writeStream.end());
                    writeStream.on("finish", () => {
                        fs.readFile(filepath, (err, buffer) => {
                            const size = Buffer.byteLength(buffer);
                            console.log(`${fileData.filename} is ${size} bytes`);
                            if (err) {
                                return reject(err);
                            }

                            files[fieldname] = {
                                fieldname,
                                name: fileData.filename,
                                extension: path.extname(fileData.filename),
                                encoding: fileData.encoding,
                                mimetype: fileData.mimeType,
                                type: fileData.mimeType,
                                buffer,
                                size,
                            };

                            try {
                                fs.unlinkSync(filepath);
                            } catch (error) {
                                return reject(error);
                            }

                            resolve();
                        });
                    });
                    writeStream.on("error", reject);
                })
            );
        });

        busboy.on("error", (e) => {
            throw new CustomError({message: 'middleware:fileupload:busboy.', error: e as any, httpResponseCode: 400, httpResponse: res })
        })
        busboy.on("finish", () => {
            Promise.all(fileWrites)
                .then(() => {
                    req.body = fields;
                    req['files'] = files;
                    next();
                })
                .catch(next);
        });

        busboy.end(req['rawBody']);

    } catch (error) {
        throw new CustomError({message: 'middleware:fileupload.', error, httpResponseCode: 400, httpResponse: res })

    }
};