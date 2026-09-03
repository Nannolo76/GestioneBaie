const { Project, SyntaxKind } = require('ts-morph');
const project = new Project();
const sourceFile = project.addSourceFileAtPath('src/context/AppContext.tsx');

// Add useAlert import
sourceFile.addImportDeclaration({
  namedImports: ['useAlert'],
  moduleSpecifier: './AlertContext'
});

const appProvider = sourceFile.getVariableDeclaration('AppProvider').getInitializerIfKindOrThrow(SyntaxKind.ArrowFunction);
const block = appProvider.getBodyIfKindOrThrow(SyntaxKind.Block);

// Add handleError helper
block.insertStatements(0, `
  const { showAlert } = useAlert();
  const handleError = (action: string, err: any) => {
    showAlert({
      title: 'Errore di Sincronizzazione',
      message: \`Impossibile completare l'operazione (\${action}). Il server ha restituito un errore. Le modifiche non sono state salvate.\`,
      isDanger: true,
      confirmLabel: 'OK'
    });
  };
`);

const varDecls = block.getVariableDeclarations();

for (const varDecl of varDecls) {
  const init = varDecl.getInitializer();
  if (init && init.getKind() === SyntaxKind.ArrowFunction) {
    const arrowFunc = init;
    const funcBody = arrowFunc.getBody();
    
    if (funcBody.getKind() === SyntaxKind.Block) {
      const statements = funcBody.getStatements();
      
      let saveActionStmt = null;
      let saveActionIdx = -1;
      let actionName = 'Sconosciuta';
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.getKind() === SyntaxKind.ExpressionStatement) {
          const expr = stmt.getExpression();
          if (expr.getKind() === SyntaxKind.CallExpression) {
            const caller = expr.getExpression();
            if (caller.getText() === 'saveAction') {
              saveActionStmt = stmt;
              saveActionIdx = i;
              const args = expr.getArguments();
              if (args.length > 0) {
                 actionName = args[0].getText().replace(/['"]/g, '');
              }
              break;
            }
          }
        }
      }
      
      if (saveActionStmt) {
        arrowFunc.setIsAsync(true);
        
        // Find state updates (set...) and logActivity
        const stateUpdates = [];
        const preComputations = [];
        
        for (let i = 0; i < statements.length; i++) {
          if (i === saveActionIdx) continue;
          
          const stmt = statements[i];
          const text = stmt.getText();
          if (text.startsWith('set') || text.startsWith('logActivity')) {
            stateUpdates.push(text);
          } else {
            preComputations.push(text);
          }
        }
        
        // Replace body
        const tryCatchCode = `
try {
  await ${saveActionStmt.getText()}
  ${stateUpdates.join('\n  ')}
} catch (err) {
  handleError('${actionName}', err);
}
`;
        // Instead of removing statements one by one which messes up AST indices, just replace the whole body text
        const newBodyText = preComputations.join('\n') + '\n' + tryCatchCode;
        arrowFunc.setBodyText(newBodyText);
      }
    }
  }
}

sourceFile.saveSync();
console.log('Refactored AppContext.tsx for Pessimistic Updates!');
