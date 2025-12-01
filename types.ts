
export interface IndustrialFormState {
  // Cabeçalho
  data: string;
  horaInicio: string;
  horaFim: string;
  inspetor: string;
  corTinta: string;
  fornecedor: string;
  lote: string;
  item: string;
  descricao: string;
  pedido: string;
  cliente: string;
  ordemProducao: string;

  // Coluna Esquerda: Parâmetros
  ultimaTrocaVenturi: string;
  
  // Campos divididos 1/2
  velocidadeReciprocador1: string;
  velocidadeReciprocador2: string;
  
  tensao1: string;
  tensao2: string;
  
  // Campos % e Valor
  velocidadeCabinePct: string;
  velocidadeCabineValor: string;
  
  velocidadeEstufaPct: string;
  velocidadeEstufaValor: string;
  
  tempEntradaProg: string;
  tempEntradaReal: string;
  tempSaidaProg: string;
  tempSaidaReal: string;
  
  // Campos duplos
  pressaoBicosDeseng: string;
  pressaoBicosFosf: string;
  
  limpezaPosSecagem: 'OK' | 'AGUA' | '';
  contaminacao: {
    graxa: boolean;
    oleo: boolean;
    outros: boolean;
  };

  // Coluna Meio: Vazões (Pistolas)
  // Espelho (1-10, 21, 22) e Dobra (11-20, 23, 24)
  pistolas: Record<string, string>;

  // Coluna Direita: Camadas
  barraId: string;
  camadas: {
    topoEsq: string; topoCentro: string; topoDir: string;
    meioEsq: string; meioCentro: string; meioDir: string;
    baixoEsq: string; baixoCentro: string; baixoDir: string;
  };
  
  // Checklist Barra
  retoqueLiq: 'com' | 'sem' | '';
  misturaItens: 'com' | 'sem' | '';
  retrabalho: 'com' | 'sem' | '';

  // Avaliação Final
  testeCura: 'OK' | 'NAO OK' | '';
  testeAderencia: 'OK' | 'NAO OK' | '';
  testeVisual: 'OK' | 'NAO OK' | '';
}

export interface GoogleScriptPayload {
  formData: Record<string, string>;
  pdfData: string;
}
