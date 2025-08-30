import { CanvasState } from '../types/drawing';

export const exportToJSON = (canvasState: CanvasState): void => {
  try {
    const dataStr = JSON.stringify(canvasState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '').replace('T', '_');
    link.download = `Rabisco_${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Erro ao exportar:', error);
    alert('Erro ao salvar o arquivo.');
  }
};

export const importFromJSON = (
  file: File,
  onSuccess: (state: CanvasState) => void,
  onError: (message: string) => void
): void => {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const content = event.target?.result as string;
      const parsedState = JSON.parse(content) as CanvasState;
      
      // Validação básica do formato
      if (!parsedState.elements || !Array.isArray(parsedState.elements)) {
        throw new Error('Formato de arquivo inválido');
      }
      
      onSuccess(parsedState);
    } catch (error) {
      console.error('Erro ao importar:', error);
      onError('Erro: O arquivo selecionado não é um arquivo válido do Rabisco.');
    }
  };
  
  reader.onerror = () => {
    onError('Erro ao ler o arquivo.');
  };
  
  reader.readAsText(file);
};
