
import { IndustrialFormState } from './types';

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUOugJnIbGvvGvCm4ggvaBlVtmieskNdF4UpXD5yIoyzzqL4Hp9g2v2fmbouXT0qvNIg/exec';

export const INITIAL_FORM_STATE: IndustrialFormState = {
  data: new Date().toISOString().split('T')[0],
  horaInicio: '',
  horaFim: '',
  inspetor: '',
  corTinta: '',
  fornecedor: '',
  lote: '',
  item: '',
  descricao: '',
  pedido: '',
  cliente: '',
  ordemProducao: '',

  ultimaTrocaVenturi: '',
  
  velocidadeReciprocador1: '',
  velocidadeReciprocador2: '',
  
  tensao1: '',
  tensao2: '',
  
  velocidadeCabinePct: '',
  velocidadeCabineValor: '',
  
  velocidadeEstufaPct: '',
  velocidadeEstufaValor: '',
  
  tempEntradaProg: '',
  tempEntradaReal: '',
  tempSaidaProg: '',
  tempSaidaReal: '',
  
  pressaoBicosDeseng: '',
  pressaoBicosFosf: '',
  
  limpezaPosSecagem: '',
  contaminacao: {
    graxa: false,
    oleo: false,
    outros: false
  },

  pistolas: {
    p1: '', p2: '', p3: '', p4: '', p5: '', p6: '', p7: '', p8: '', p9: '', p10: '',
    p11: '', p12: '', p13: '', p14: '', p15: '', p16: '', p17: '', p18: '', p19: '', p20: '',
    p21: '', p22: '', p23: '', p24: ''
  },

  barraId: '',
  camadas: {
    topoEsq: '', topoCentro: '', topoDir: '',
    meioEsq: '', meioCentro: '', meioDir: '',
    baixoEsq: '', baixoCentro: '', baixoDir: ''
  },

  retoqueLiq: '',
  misturaItens: '',
  retrabalho: '',

  testeCura: '',
  testeAderencia: '',
  testeVisual: ''
};
