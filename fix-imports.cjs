const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const uiComponents = new Set([
  'button', 'card', 'Toast', 'Checkbox', 'Select', 'TextArea', 'Input', 'input',
  'accordion', 'alert', 'avatar', 'badge', 'dropdown-menu', 'sheet', 'skeleton', 'tooltip', 'sidebar', 'pagination', 'separator', 'breadcrumb'
]);

const appComponents = new Set([
  'Calendario', 'FilasUsuario', 'Formulario', 'FormularioRegistroEquipo', 'FormularioSesion',
  'Leyenda', 'MenuLateral', 'ProtectedRoute', 'PublicRoute', 'SpainProvinciasMapa',
  'TablaRegistroEventos', 'TablaRegistroMapa', 'TablaUsuarios', 'app-sidebar', 'NotificationBell'
]);

const appDirs = ['notas', 'modales'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We are looking for lines like: import ... from "relative/path"
  // Example: import { Button } from "../components/button"
  // We want to transform them to absolute `@/components/...` based on the known sets.

  // Regex matches: import ... from ['"](path)['"]
  const importRegex = /from\s+['"]([^'"]+)['"]/g;

  content = content.replace(importRegex, (match, importPath) => {
    // Only target imports pointing inside components
    if (!importPath.includes('components/')) return match;
    
    // Resolve what the path refers to. It might be relative, like `../components/button`
    // Or it might be `../../components/modales/EventModal`
    
    // Extract everything after 'components/'
    const afterComponents = importPath.split('components/')[1];
    
    // Check if it's already properly pathed inside app/ or ui/
    if (afterComponents.startsWith('app/') || afterComponents.startsWith('ui/')) {
        // Just make sure to convert back pointing relative to absolute @/
        if (!importPath.startsWith('@/')) {
           return `from "@/components/${afterComponents}"`;
        }
        return match;
    }

    // Try to categorize
    const parts = afterComponents.split('/');
    const mainPart = parts[0].replace('.tsx', '').replace('.ts', '');

    let newPath = '';

    if (uiComponents.has(mainPart) || (parts.length > 1 && parts[0] === 'inputs')) {
      let finalName = parts.length > 1 ? parts[1] : mainPart;
      if(finalName.toLowerCase() === 'input') finalName = 'input'; // normalize input filename
      newPath = `@/components/ui/${finalName}`;
    } else if (appComponents.has(mainPart)) {
      newPath = `@/components/app/${mainPart}`;
    } else if (appDirs.includes(mainPart) && parts.length > 1) {
      newPath = `@/components/app/${mainPart}/${parts[1]}`;
    } else {
      console.log(`Unknown map for: ${afterComponents} in ${filePath}`);
      // fallback
      return match;
    }

    // Remove .tsx extension if it carried over
    newPath = newPath.replace('.tsx', '').replace('.ts', '');

    return `from "${newPath}"`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

traverse(srcDir);
console.log('Done!');
