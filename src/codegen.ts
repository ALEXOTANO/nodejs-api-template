import type { CodegenConfig } from '@graphql-codegen/cli';
import { TypeScriptResolversPluginConfig } from '@graphql-codegen/typescript-resolvers';

const config: CodegenConfig = {
    overwrite: true,
    schema: 'src/graphQL/**/*.graphql',
    documents: null,
    generates: {
        'src/types/autogen/types.ts': {
            plugins: [
                {
                    add: { content: '/* eslint-disable */' },
                },
                'typescript',
                'typescript-resolvers',
            ],
            config: {
                extractAllFieldsToTypes: true,
                constEnums: false,
                enumsAsTypes: false,
                skipTypename: true,
                useIndexSignature: true,
                preResolveTypes: false,
                avoidOptionals: false,
                scalars: {
                    Any: 'any',
                },
                mappers: {},
                enumValues: {},
            } as TypeScriptResolversPluginConfig,
        },
    },
};

export default config;
