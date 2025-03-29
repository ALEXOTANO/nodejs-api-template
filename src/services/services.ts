//? import { FirebaseService } from './firebase.service';
import { postgresService } from './postgres.service';
import { SupabaseService } from './supabase.service';

export const Services = {
    firebaseService: null,
    // ? firebaseService: FirebaseService, // Uncomment this line if you have a firebase service
    postgresService,
    SupabaseService,
};
