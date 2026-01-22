#!/usr/bin/env node
/**
 * Script de configuración automática para producción
 * Uso: node scripts/setup-production.js <DATABASE_URL>
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🚀 Configuración de AT5 Audit Platform para Producción\n');
  console.log('=' .repeat(60));

  // Obtener DATABASE_URL
  let databaseUrl = process.argv[2];

  if (!databaseUrl) {
    console.log('\n📝 Necesitas una base de datos PostgreSQL.');
    console.log('   Recomendamos Neon (https://neon.tech) - es gratis.\n');
    databaseUrl = await question('Pega tu DATABASE_URL de PostgreSQL: ');
  }

  if (!databaseUrl || !databaseUrl.startsWith('postgresql://')) {
    console.error('\n❌ Error: DATABASE_URL inválida. Debe empezar con postgresql://');
    process.exit(1);
  }

  console.log('\n✅ DATABASE_URL recibida');

  // Generar AUTH_SECRET seguro
  const authSecret = require('crypto').randomBytes(32).toString('hex');
  console.log('✅ AUTH_SECRET generado');

  // Crear archivo .env.production
  const envContent = `# Producción - AT5 Audit Platform
# Generado automáticamente el ${new Date().toISOString()}

# NextAuth Configuration
AUTH_SECRET=${authSecret}
NEXTAUTH_URL=https://prueba-software-axon.web.app

# Database - PostgreSQL (Neon)
DATABASE_URL="${databaseUrl}"

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prueba-software-axon
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prueba-software-axon.appspot.com
`;

  fs.writeFileSync(path.join(__dirname, '..', '.env.production'), envContent);
  console.log('✅ Archivo .env.production creado');

  // También actualizar .env para desarrollo local con PostgreSQL
  const envLocalContent = `# Desarrollo Local - AT5 Audit Platform

# NextAuth Configuration
AUTH_SECRET=${authSecret}
NEXTAUTH_URL=http://localhost:3000

# Database - PostgreSQL (Neon)
DATABASE_URL="${databaseUrl}"

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prueba-software-axon
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prueba-software-axon.appspot.com
`;

  fs.writeFileSync(path.join(__dirname, '..', '.env'), envLocalContent);
  console.log('✅ Archivo .env actualizado');

  // Ejecutar migraciones de Prisma
  console.log('\n📦 Generando cliente Prisma...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Cliente Prisma generado');
  } catch (error) {
    console.error('❌ Error generando cliente Prisma');
    process.exit(1);
  }

  console.log('\n📦 Ejecutando migraciones de base de datos...');
  try {
    execSync('npx prisma db push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Schema sincronizado con la base de datos');
  } catch (error) {
    console.error('❌ Error en migraciones');
    process.exit(1);
  }

  // Preguntar si quiere ejecutar seed
  const runSeed = await question('\n¿Deseas cargar datos iniciales (usuarios de prueba)? (s/n): ');

  if (runSeed.toLowerCase() === 's' || runSeed.toLowerCase() === 'si') {
    console.log('\n📦 Cargando datos iniciales...');
    try {
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      console.log('✅ Datos iniciales cargados');
    } catch (error) {
      console.error('⚠️ Error cargando datos iniciales (puede que ya existan)');
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ ¡Configuración completada!');
  console.log('\nPróximos pasos:');
  console.log('1. Ejecuta: npm run build');
  console.log('2. Ejecuta: firebase deploy');
  console.log('\nO simplemente ejecuta: npm run deploy');
  console.log('=' .repeat(60) + '\n');

  rl.close();
}

main().catch(console.error);
