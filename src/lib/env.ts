interface EnvironmentVariables {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_STRIPE_PUBLISHABLE_KEY: string;
  VITE_API_URL: string;
}

// Define validation rules for each environment variable
const validationRules: Record<keyof EnvironmentVariables, (value: string) => boolean> = {
  VITE_SUPABASE_URL: (value) => Boolean(value) && value.startsWith('https://'),
  VITE_SUPABASE_ANON_KEY: (value) => Boolean(value) && value.length > 10,
  VITE_STRIPE_PUBLISHABLE_KEY: (value) => Boolean(value) && value.startsWith('pk_'),
  VITE_API_URL: (value) => Boolean(value) && (value.startsWith('http://') || value.startsWith('https://'))
};

// Error messages for failed validations
const errorMessages: Record<keyof EnvironmentVariables, string> = {
  VITE_SUPABASE_URL: 'Supabase URL must be a valid HTTPS URL',
  VITE_SUPABASE_ANON_KEY: 'Supabase anon key is missing or invalid',
  VITE_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key must start with "pk_"',
  VITE_API_URL: 'API URL must be a valid HTTP or HTTPS URL'
};

// Extract environment variables with proper typing
export const env = Object.keys(import.meta.env).reduce((acc, key) => {
  if (key in validationRules) {
    acc[key as keyof EnvironmentVariables] = import.meta.env[key] as string;
  }
  return acc;
}, {} as Partial<EnvironmentVariables>);

// Validate all environment variables
export function validateEnvironmentVariables(): void {
  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  (Object.keys(validationRules) as Array<keyof EnvironmentVariables>).forEach(key => {
    if (!env[key]) {
      missingVars.push(key);
    } else if (!validationRules[key](env[key] as string)) {
      invalidVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`);
  }

  if (invalidVars.length > 0) {
    invalidVars.forEach(key => {
      console.error(`Invalid environment variable: ${key} - ${errorMessages[key as keyof EnvironmentVariables]}`);
    });
  }

  if (missingVars.length > 0 || invalidVars.length > 0) {
    throw new Error('Environment validation failed. Check the console for details.');
  }

  // Freeze the environment object to prevent modifications
  Object.freeze(env);
}

// Type-safe accessor for environment variables
export function getEnv<K extends keyof EnvironmentVariables>(key: K): string {
  if (!env[key]) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return env[key] as string;
} 