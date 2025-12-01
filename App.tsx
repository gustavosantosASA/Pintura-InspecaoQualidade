
import React, { useState } from 'react';
import { 
  Save, 
  Loader2, 
  Printer
} from 'lucide-react';
import { GOOGLE_SCRIPT_URL, INITIAL_FORM_STATE } from './constants';
import { IndustrialFormState, GoogleScriptPayload } from './types';
import SignaturePad from './components/SignaturePad';
import { generatePDF } from './services/pdfService';
import clsx from 'clsx';

// Estilos constantes para consistência corporativa
const BORDER_CLS = "border-slate-400";
// Adicionado justify-center e text-center para alinhamento horizontal perfeito
const LABEL_CLS = "bg-slate-100 text-slate-700 font-bold p-1.5 flex items-center justify-center text-center text-[11px] md:text-xs uppercase tracking-tight leading-tight";
const HEADER_CLS = "bg-slate-800 text-white font-bold text-center py-2 uppercase tracking-wide text-sm border-b";
const INPUT_CONTAINER_CLS = "bg-white relative";
const INPUT_CLS = "w-full h-full bg-transparent text-center text-slate-900 font-medium focus:bg-blue-50 focus:ring-inset focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors placeholder-slate-300 text-xs md:text-sm";

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState<IndustrialFormState>(INITIAL_FORM_STATE);
  const [signature, setSignature] = useState<string | null>(null);

  // Generic Change Handler
  const handleChange = (field: keyof IndustrialFormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Nested Change Handlers
  const handlePistolaChange = (id: string, value: string) => {
    setForm(prev => ({
      ...prev,
      pistolas: { ...prev.pistolas, [id]: value }
    }));
  };

  const handleCamadaChange = (key: keyof IndustrialFormState['camadas'], value: string) => {
    setForm(prev => ({
      ...prev,
      camadas: { ...prev.camadas, [key]: value }
    }));
  };

  const handleContaminacaoChange = (key: keyof IndustrialFormState['contaminacao']) => {
    setForm(prev => ({
      ...prev,
      contaminacao: { ...prev.contaminacao, [key]: !prev.contaminacao[key] }
    }));
  };

  const handleSubmit = async () => {
    if (!form.inspetor || !form.ordemProducao) {
      alert('Por favor, preencha pelo menos o Inspetor e a Ordem de Produção.');
      return;
    }
    if (!signature) {
      alert('A assinatura do inspetor é obrigatória.');
      return;
    }

    setLoading(true);
    setSuccessMsg(null);

    try {
      const pdfBase64 = await generatePDF('industrial-report');

      // Flatten nested objects for simple key-value pairs in Sheets
      const flattenedData: Record<string, string> = {
        ...form as any,
        contaminacao: Object.entries(form.contaminacao).filter(([_, v]) => v).map(([k]) => k).join(', '),
        ...form.pistolas, // Spreads p1...p24 directly
        ...form.camadas,  // Spreads topoEsq...baixoDir directly
      };

      // Remove nested objects from payload to avoid [object Object] in sheets
      delete flattenedData.pistolas;
      delete flattenedData.camadas;

      const payload: GoogleScriptPayload = {
        formData: flattenedData,
        pdfData: pdfBase64
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccessMsg(`Relatório salvo com sucesso!`);
        // Opcional: Resetar formulário aqui se desejado
      } else {
        throw new Error(result.message || 'Erro desconhecido');
      }

    } catch (error) {
      console.error(error);
      alert('Erro ao enviar relatório. Verifique a conexão ou o script.');
    } finally {
      setLoading(false);
    }
  };

  // Componente de Input Auxiliar
  const TableInput = ({ value, onChange, className, type = "text", placeholder }: { value: string, onChange: (val: string) => void, className?: string, type?: string, placeholder?: string }) => (
    <input 
      type={type}
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className={clsx(INPUT_CLS, className)}
      placeholder={placeholder}
    />
  );

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans print:bg-white print:p-0">
      
      {/* Controls - Hidden on Print */}
      <div className="max-w-[1100px] mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inspeção Industrial</h1>
          <p className="text-slate-500 text-sm">Controle de Qualidade Diário</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => window.print()} 
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <Printer size={16} /> Imprimir
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-blue-700 text-white px-5 py-2 rounded-md shadow-md flex items-center gap-2 hover:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? 'Processando...' : 'Salvar & Finalizar'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="max-w-[1100px] mx-auto mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center shadow-sm no-print">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
          {successMsg}
        </div>
      )}

      {/* Main Report Form */}
      <div id="industrial-report" className={clsx("max-w-[1100px] mx-auto bg-white shadow-xl print:shadow-none border rounded-sm overflow-hidden text-slate-900 print:border-none", BORDER_CLS)}>
        
        {/* Header Title */}
        <div className={clsx(HEADER_CLS, BORDER_CLS)}>
          Inspeção Diária ou Homologação - Qualidade Industrial
        </div>

        {/* Header Grid */}
        <div className={clsx("border-b", BORDER_CLS)}>
          {/* Row 1 */}
          <div className={clsx("flex border-b", BORDER_CLS)}>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Data:</div>
            <div className={clsx("flex-1 border-r", INPUT_CONTAINER_CLS, BORDER_CLS)}>
              <TableInput type="date" value={form.data} onChange={(v) => handleChange('data', v)} className="text-left px-2" />
            </div>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Hora Início:</div>
            <div className={clsx("flex-1 border-r", INPUT_CONTAINER_CLS, BORDER_CLS)}>
              <TableInput type="time" value={form.horaInicio} onChange={(v) => handleChange('horaInicio', v)} />
            </div>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Hora Fim:</div>
            <div className={clsx("flex-1 border-r", INPUT_CONTAINER_CLS, BORDER_CLS)}>
              <TableInput type="time" value={form.horaFim} onChange={(v) => handleChange('horaFim', v)} />
            </div>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Inspetor:</div>
            <div className={clsx("flex-[2]", INPUT_CONTAINER_CLS)}>
              <TableInput value={form.inspetor} onChange={(v) => handleChange('inspetor', v)} className="text-left px-2 uppercase" />
            </div>
          </div>

          {/* Row 2 */}
          <div className={clsx("flex border-b", BORDER_CLS)}>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Cor da tinta:</div>
            <div className={clsx("flex-[2] border-r", INPUT_CONTAINER_CLS, BORDER_CLS)}>
              <TableInput value={form.corTinta} onChange={(v) => handleChange('corTinta', v)} className="text-left px-2" />
            </div>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Fornecedor:</div>
            <div className={clsx("flex-[2] border-r", INPUT_CONTAINER_CLS, BORDER_CLS)}>
              <TableInput value={form.fornecedor} onChange={(v) => handleChange('fornecedor', v)} className="text-left px-2" />
            </div>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Lote:</div>
            <div className={clsx("flex-1", INPUT_CONTAINER_CLS)}>
              <TableInput value={form.lote} onChange={(v) => handleChange('lote', v)} />
            </div>
          </div>

          {/* Row 3 */}
          <div className={clsx("flex border-b", BORDER_CLS)}>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Item</div>
            <div className={clsx("flex-[2] border-r", INPUT_CONTAINER_CLS, BORDER_CLS)}>
              <TableInput value={form.item} onChange={(v) => handleChange('item', v)} className="text-left px-2" />
            </div>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Descrição</div>
            <div className={clsx("flex-[3]", INPUT_CONTAINER_CLS)}>
              <TableInput value={form.descricao} onChange={(v) => handleChange('descricao', v)} className="text-left px-2" />
            </div>
          </div>

           {/* Row 4 */}
           <div className="flex">
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Pedido</div>
            <div className={clsx("flex-[2] border-r", INPUT_CONTAINER_CLS, BORDER_CLS)}>
              <TableInput value={form.pedido} onChange={(v) => handleChange('pedido', v)} className="text-left px-2" />
            </div>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Cliente</div>
            <div className={clsx("flex-[2] border-r", INPUT_CONTAINER_CLS, BORDER_CLS)}>
              <TableInput value={form.cliente} onChange={(v) => handleChange('cliente', v)} className="text-left px-2" />
            </div>
            <div className={clsx("w-24 border-r", LABEL_CLS, BORDER_CLS)}>Ordem Prod.</div>
            <div className={clsx("flex-1", INPUT_CONTAINER_CLS)}>
              <TableInput value={form.ordemProducao} onChange={(v) => handleChange('ordemProducao', v)} />
            </div>
          </div>
        </div>

        {/* Body Content - 3 Columns Layout */}
        <div className="grid grid-cols-12">
          
          {/* Column 1 - Left - Process Parameters */}
          <div className={clsx("col-span-12 md:col-span-4 border-r p-3", BORDER_CLS)}>
            <table className={clsx("w-full border-collapse border mb-4 shadow-sm", BORDER_CLS)}>
              <tbody>
                <tr>
                  <td className={clsx("text-white p-2 border text-xs font-semibold bg-slate-600", BORDER_CLS)}>Última troca Venturi:</td>
                  <td className={clsx("border bg-white h-9", BORDER_CLS)}>
                    <TableInput type="date" value={form.ultimaTrocaVenturi} onChange={v => handleChange('ultimaTrocaVenturi', v)} className="px-1" />
                  </td>
                </tr>
                
                {/* Velocidade Reciprocador 1/2 (Split Field) */}
                <tr>
                  <td className={clsx("text-white p-2 border text-xs font-semibold bg-slate-600", BORDER_CLS)}>Velocidade cabine Reciprocador 1/2:</td>
                  <td className={clsx("border bg-white h-9 p-0", BORDER_CLS)}>
                    <div className="flex h-full w-full">
                       <div className={clsx("w-1/2 border-r relative h-full", BORDER_CLS)}>
                          <span className="absolute left-1 top-0.5 text-[8px] text-slate-400">1</span>
                          <TableInput value={form.velocidadeReciprocador1} onChange={v => handleChange('velocidadeReciprocador1', v)} />
                       </div>
                       <div className="w-1/2 relative h-full">
                          <span className="absolute left-1 top-0.5 text-[8px] text-slate-400">2</span>
                          <TableInput value={form.velocidadeReciprocador2} onChange={v => handleChange('velocidadeReciprocador2', v)} />
                       </div>
                    </div>
                  </td>
                </tr>

                {/* Tensão 1/2 (Split Field) */}
                <tr>
                  <td className={clsx("text-white p-2 border text-xs font-semibold bg-slate-600", BORDER_CLS)}>Tensão 1/2:</td>
                  <td className={clsx("border bg-white h-9 p-0", BORDER_CLS)}>
                    <div className="flex h-full w-full">
                       <div className={clsx("w-1/2 border-r relative h-full", BORDER_CLS)}>
                          <span className="absolute left-1 top-0.5 text-[8px] text-slate-400">1</span>
                          <TableInput value={form.tensao1} onChange={v => handleChange('tensao1', v)} />
                       </div>
                       <div className="w-1/2 relative h-full">
                          <span className="absolute left-1 top-0.5 text-[8px] text-slate-400">2</span>
                          <TableInput value={form.tensao2} onChange={v => handleChange('tensao2', v)} />
                       </div>
                    </div>
                  </td>
                </tr>

                {/* Velocidade Cabine Painel 2 (% and Num) */}
                <tr>
                  <td className={clsx("text-white p-2 border text-xs font-semibold bg-slate-600", BORDER_CLS)}>Velocidade cabine painel 2:</td>
                  <td className={clsx("border bg-white h-9 p-0", BORDER_CLS)}>
                    <div className="flex h-full w-full">
                       <div className={clsx("w-1/2 border-r flex items-center pr-2 h-full", BORDER_CLS)}>
                          <TableInput value={form.velocidadeCabinePct} onChange={v => handleChange('velocidadeCabinePct', v)} />
                          <span className="text-slate-400 text-xs">%</span>
                       </div>
                       <div className="w-1/2 h-full">
                          <TableInput value={form.velocidadeCabineValor} onChange={v => handleChange('velocidadeCabineValor', v)} placeholder="Valor" />
                       </div>
                    </div>
                  </td>
                </tr>

                {/* Velocidade Estufa (% and Num) */}
                <tr>
                  <td className={clsx("text-white p-2 border text-xs font-semibold bg-slate-600", BORDER_CLS)}>Velocidade estufa (rápida):</td>
                  <td className={clsx("border bg-white h-9 p-0", BORDER_CLS)}>
                    <div className="flex h-full w-full">
                       <div className={clsx("w-1/2 border-r flex items-center pr-2 h-full", BORDER_CLS)}>
                          <TableInput value={form.velocidadeEstufaPct} onChange={v => handleChange('velocidadeEstufaPct', v)} />
                          <span className="text-slate-400 text-xs">%</span>
                       </div>
                       <div className="w-1/2 h-full">
                          <TableInput value={form.velocidadeEstufaValor} onChange={v => handleChange('velocidadeEstufaValor', v)} placeholder="Valor" />
                       </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className={clsx("w-full border-collapse border mb-4 text-center shadow-sm", BORDER_CLS)}>
              <thead>
                <tr>
                  <td className={clsx("text-white p-2 border text-xs font-semibold bg-slate-600", BORDER_CLS)}>Temperaturas (°C):</td>
                  <td className={clsx("bg-slate-200 font-bold p-1 border text-xs text-slate-700", BORDER_CLS)}>Program.</td>
                  <td className={clsx("bg-slate-200 font-bold p-1 border text-xs text-slate-700", BORDER_CLS)}>Real</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={clsx("text-white p-2 border text-xs font-semibold bg-slate-600 text-left", BORDER_CLS)}>Entrada estufa</td>
                  <td className={clsx("border h-9 bg-white", BORDER_CLS)}><TableInput value={form.tempEntradaProg} onChange={v => handleChange('tempEntradaProg', v)} /></td>
                  <td className={clsx("border h-9 bg-white", BORDER_CLS)}><TableInput value={form.tempEntradaReal} onChange={v => handleChange('tempEntradaReal', v)} /></td>
                </tr>
                <tr>
                  <td className={clsx("text-white p-2 border text-xs font-semibold bg-slate-600 text-left", BORDER_CLS)}>Saída estufa</td>
                  <td className={clsx("border h-9 bg-white", BORDER_CLS)}><TableInput value={form.tempSaidaProg} onChange={v => handleChange('tempSaidaProg', v)} /></td>
                  <td className={clsx("border h-9 bg-white", BORDER_CLS)}><TableInput value={form.tempSaidaReal} onChange={v => handleChange('tempSaidaReal', v)} /></td>
                </tr>
              </tbody>
            </table>

            {/* Pressão Bicos (Deseng/Fosf) */}
            <div className={clsx("border mb-4 flex shadow-sm items-stretch", BORDER_CLS)}>
               <div className={clsx("text-white p-2 text-xs w-1/2 flex items-center font-semibold bg-slate-600")}>Pressão bicos Deseng/Fosf:</div>
               <div className="flex-1 bg-white flex items-center h-9">
                  <div className={clsx("w-1/2 h-full border-r", BORDER_CLS)}>
                     <TableInput value={form.pressaoBicosDeseng} onChange={v => handleChange('pressaoBicosDeseng', v)} placeholder="Deseng." />
                  </div>
                  <div className="w-1/2 h-full">
                     <TableInput value={form.pressaoBicosFosf} onChange={v => handleChange('pressaoBicosFosf', v)} placeholder="Fosf." />
                  </div>
               </div>
            </div>

            <div className={clsx("border p-3 mb-4 bg-slate-50 shadow-sm", BORDER_CLS)}>
               <div className="text-slate-800 font-bold text-xs mb-2 uppercase border-b border-slate-300 pb-1">Limpeza e umidade pós secagem:</div>
               <div className="flex justify-around text-xs font-bold text-slate-700">
                  <label className="flex items-center space-x-1 cursor-pointer hover:bg-slate-200 px-2 py-1 rounded">
                    <input type="radio" name="limpeza" checked={form.limpezaPosSecagem === 'OK'} onChange={() => handleChange('limpezaPosSecagem', 'OK')} className="accent-blue-600" />
                    <span>OK</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer hover:bg-slate-200 px-2 py-1 rounded">
                    <input type="radio" name="limpeza" checked={form.limpezaPosSecagem === 'AGUA'} onChange={() => handleChange('limpezaPosSecagem', 'AGUA')} className="accent-blue-600" />
                    <span>ÁGUA</span>
                  </label>
               </div>
            </div>

            <div className={clsx("border p-3 text-xs font-bold flex justify-between bg-white shadow-sm text-slate-700", BORDER_CLS)}>
                <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" checked={form.contaminacao.graxa} onChange={() => handleContaminacaoChange('graxa')} className="accent-blue-600 rounded" />
                    <span>GRAXA</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" checked={form.contaminacao.oleo} onChange={() => handleContaminacaoChange('oleo')} className="accent-blue-600 rounded" />
                    <span>ÓLEO</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" checked={form.contaminacao.outros} onChange={() => handleContaminacaoChange('outros')} className="accent-blue-600 rounded" />
                    <span>OUTROS</span>
                </label>
            </div>
          </div>

          {/* Column 2 - Middle - Guns */}
          <div className={clsx("col-span-12 md:col-span-4 border-r p-3 bg-slate-50/50", BORDER_CLS)}>
            <div className={clsx("bg-slate-700 text-white font-bold text-center border py-1.5 uppercase text-xs tracking-wide", BORDER_CLS)}>Vazões das pistolas:</div>
            <table className={clsx("w-full border-collapse border text-center text-xs bg-white shadow-sm", BORDER_CLS)}>
              <thead>
                <tr>
                  <th className={clsx("border bg-slate-200 p-2 w-1/2 text-slate-800", BORDER_CLS)}>Espelho</th>
                  <th className={clsx("border bg-slate-200 p-2 w-1/2 text-slate-800", BORDER_CLS)}>Dobra</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', '11'], ['2', '12'], ['3', '13'], ['4', '14'], 
                  ['5', '15'], ['6', '16'], ['7', '17'], ['8', '18'], 
                  ['9', '19'], ['10', '20'], ['21', '23'], ['22', '24']
                ].map(([leftId, rightId], idx) => (
                  <tr key={idx} className="h-8 hover:bg-slate-50">
                    <td className={clsx("border relative", BORDER_CLS)}>
                      <span className="absolute left-1.5 top-2 text-[10px] font-bold text-slate-400">{leftId}</span>
                      <TableInput value={form.pistolas[`p${leftId}`]} onChange={v => handlePistolaChange(`p${leftId}`, v)} />
                    </td>
                    <td className={clsx("border relative", BORDER_CLS)}>
                      <span className="absolute right-1.5 top-2 text-[10px] font-bold text-slate-400">{rightId}</span>
                      <TableInput value={form.pistolas[`p${rightId}`]} onChange={v => handlePistolaChange(`p${rightId}`, v)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Column 3 - Right - Layers & Evaluation */}
          <div className="col-span-12 md:col-span-4 p-3 flex flex-col justify-between">
            <div>
              <div className={clsx("flex border mb-3 shadow-sm", BORDER_CLS)}>
                <div className={clsx("bg-slate-200 font-bold px-3 py-1 flex items-center border-r text-slate-800 text-xs", BORDER_CLS)}>Barra:</div>
                <div className="flex-1 bg-white"><TableInput value={form.barraId} onChange={v => handleChange('barraId', v)} /></div>
              </div>

              <table className={clsx("w-full border-collapse border text-center text-xs mb-4 bg-white shadow-sm", BORDER_CLS)}>
                <thead>
                  <tr>
                    <th className={clsx("bg-slate-600 text-white border p-1.5 w-1/4", BORDER_CLS)}>Camadas</th>
                    <th className={clsx("bg-slate-200 border p-1.5 text-slate-700", BORDER_CLS)}>Esq.</th>
                    <th className={clsx("bg-slate-200 border p-1.5 text-slate-700", BORDER_CLS)}>Centro</th>
                    <th className={clsx("bg-slate-200 border p-1.5 text-slate-700", BORDER_CLS)}>Dir.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={clsx("bg-slate-100 font-bold border text-slate-600", BORDER_CLS)}>Topo</td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.topoEsq} onChange={v => handleCamadaChange('topoEsq', v)} /></td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.topoCentro} onChange={v => handleCamadaChange('topoCentro', v)} /></td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.topoDir} onChange={v => handleCamadaChange('topoDir', v)} /></td>
                  </tr>
                  <tr>
                    <td className={clsx("bg-slate-100 font-bold border text-slate-600", BORDER_CLS)}>Meio</td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.meioEsq} onChange={v => handleCamadaChange('meioEsq', v)} /></td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.meioCentro} onChange={v => handleCamadaChange('meioCentro', v)} /></td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.meioDir} onChange={v => handleCamadaChange('meioDir', v)} /></td>
                  </tr>
                  <tr>
                    <td className={clsx("bg-slate-100 font-bold border text-slate-600", BORDER_CLS)}>Baixo</td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.baixoEsq} onChange={v => handleCamadaChange('baixoEsq', v)} /></td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.baixoCentro} onChange={v => handleCamadaChange('baixoCentro', v)} /></td>
                    <td className={clsx("border h-9", BORDER_CLS)}><TableInput value={form.camadas.baixoDir} onChange={v => handleCamadaChange('baixoDir', v)} /></td>
                  </tr>
                </tbody>
              </table>

              {/* Checklist Section */}
              <div className={clsx("border bg-slate-50 p-3 mb-4 text-xs space-y-2 shadow-sm", BORDER_CLS)}>
                  <div className={clsx("flex items-center justify-between bg-white p-2 border rounded-sm", BORDER_CLS)}>
                    <span className="font-bold mr-2 text-slate-700">Retoque Líq:</span>
                    <div className="flex space-x-3 text-slate-600">
                       <label className="flex items-center cursor-pointer"><input type="radio" name="retoque" checked={form.retoqueLiq === 'com'} onChange={() => handleChange('retoqueLiq', 'com')} className="mr-1 accent-blue-600"/> Com</label>
                       <span className="text-slate-300">|</span>
                       <label className="flex items-center cursor-pointer"><input type="radio" name="retoque" checked={form.retoqueLiq === 'sem'} onChange={() => handleChange('retoqueLiq', 'sem')} className="mr-1 accent-blue-600"/> Sem</label>
                    </div>
                  </div>
                  <div className={clsx("flex items-center justify-between bg-white p-2 border rounded-sm", BORDER_CLS)}>
                     <span className="font-bold mr-2 text-slate-700">Mistura Itens:</span>
                     <div className="flex space-x-3 text-slate-600">
                      <label className="flex items-center cursor-pointer"><input type="radio" name="mistura" checked={form.misturaItens === 'com'} onChange={() => handleChange('misturaItens', 'com')} className="mr-1 accent-blue-600"/> Com</label>
                      <span className="text-slate-300">|</span>
                      <label className="flex items-center cursor-pointer"><input type="radio" name="mistura" checked={form.misturaItens === 'sem'} onChange={() => handleChange('misturaItens', 'sem')} className="mr-1 accent-blue-600"/> Sem</label>
                     </div>
                  </div>
                  <div className={clsx("flex items-center justify-between bg-white p-2 border rounded-sm", BORDER_CLS)}>
                     <span className="font-bold mr-2 text-slate-700">Retrabalho:</span>
                     <div className="flex space-x-3 text-slate-600">
                      <label className="flex items-center cursor-pointer"><input type="radio" name="retrabalho" checked={form.retrabalho === 'com'} onChange={() => handleChange('retrabalho', 'com')} className="mr-1 accent-blue-600"/> Com</label>
                      <span className="text-slate-300">|</span>
                      <label className="flex items-center cursor-pointer"><input type="radio" name="retrabalho" checked={form.retrabalho === 'sem'} onChange={() => handleChange('retrabalho', 'sem')} className="mr-1 accent-blue-600"/> Sem</label>
                     </div>
                  </div>
              </div>
            </div>

            {/* Evaluation Section */}
            <div className={clsx("border bg-white shadow-sm", BORDER_CLS)}>
               <div className={clsx("bg-slate-800 text-white font-bold text-center py-2 border-b uppercase text-sm tracking-wide", BORDER_CLS)}>Avaliação Final</div>
               <div className={clsx("grid grid-cols-1 divide-y text-xs", `divide-${BORDER_CLS.split('-')[1]}-400`)}>
                  <div className="flex justify-between items-center p-3 bg-slate-50">
                     <span className="font-bold text-slate-700 text-[13px]">Teste de cura (MEK):</span>
                     <div className="flex space-x-2">
                        <label className={clsx("cursor-pointer px-3 py-1 rounded border text-[11px] font-bold transition-all", form.testeCura === 'OK' ? "bg-green-600 text-white border-green-700 shadow-sm" : "bg-white text-slate-400 border-slate-200")}>
                           <input type="radio" className="hidden" name="cura" checked={form.testeCura === 'OK'} onChange={() => handleChange('testeCura', 'OK')} /> OK
                        </label>
                        <label className={clsx("cursor-pointer px-3 py-1 rounded border text-[11px] font-bold transition-all", form.testeCura === 'NAO OK' ? "bg-red-600 text-white border-red-700 shadow-sm" : "bg-white text-slate-400 border-slate-200")}>
                           <input type="radio" className="hidden" name="cura" checked={form.testeCura === 'NAO OK'} onChange={() => handleChange('testeCura', 'NAO OK')} /> NÃO OK
                        </label>
                     </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50">
                     <span className="font-bold text-slate-700 text-[13px]">Teste de aderência (grade):</span>
                     <div className="flex space-x-2">
                        <label className={clsx("cursor-pointer px-3 py-1 rounded border text-[11px] font-bold transition-all", form.testeAderencia === 'OK' ? "bg-green-600 text-white border-green-700 shadow-sm" : "bg-white text-slate-400 border-slate-200")}>
                           <input type="radio" className="hidden" name="aderencia" checked={form.testeAderencia === 'OK'} onChange={() => handleChange('testeAderencia', 'OK')} /> OK
                        </label>
                        <label className={clsx("cursor-pointer px-3 py-1 rounded border text-[11px] font-bold transition-all", form.testeAderencia === 'NAO OK' ? "bg-red-600 text-white border-red-700 shadow-sm" : "bg-white text-slate-400 border-slate-200")}>
                           <input type="radio" className="hidden" name="aderencia" checked={form.testeAderencia === 'NAO OK'} onChange={() => handleChange('testeAderencia', 'NAO OK')} /> NÃO OK
                        </label>
                     </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50">
                     <span className="font-bold text-slate-700 text-[13px]">Teste visual da barra:</span>
                     <div className="flex space-x-2">
                        <label className={clsx("cursor-pointer px-3 py-1 rounded border text-[11px] font-bold transition-all", form.testeVisual === 'OK' ? "bg-green-600 text-white border-green-700 shadow-sm" : "bg-white text-slate-400 border-slate-200")}>
                           <input type="radio" className="hidden" name="visual" checked={form.testeVisual === 'OK'} onChange={() => handleChange('testeVisual', 'OK')} /> OK
                        </label>
                        <label className={clsx("cursor-pointer px-3 py-1 rounded border text-[11px] font-bold transition-all", form.testeVisual === 'NAO OK' ? "bg-red-600 text-white border-red-700 shadow-sm" : "bg-white text-slate-400 border-slate-200")}>
                           <input type="radio" className="hidden" name="visual" checked={form.testeVisual === 'NAO OK'} onChange={() => handleChange('testeVisual', 'NAO OK')} /> NÃO OK
                        </label>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Signature Footer */}
        <div className={clsx("border-t p-6 bg-slate-50 mt-0 print:break-inside-avoid", BORDER_CLS)}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Assinatura do Inspetor Responsável</label>
                <div className="max-w-md">
                  <SignaturePad onEnd={setSignature} />
                </div>
                <div className="mt-2 text-[10px] text-slate-400">
                  Declaro que as informações acima são verdadeiras e a inspeção foi realizada conforme as normas técnicas.
                </div>
             </div>
             <div className="hidden md:block w-px h-32 bg-slate-300"></div>
             <div className="flex-1 w-full text-slate-500 text-xs">
                <p className="font-bold mb-1">Status do Processo:</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx("w-3 h-3 rounded-full", form.testeVisual === 'OK' && form.testeCura === 'OK' ? "bg-green-500" : "bg-gray-300")}></div>
                  <span>Aprovado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={clsx("w-3 h-3 rounded-full", form.testeVisual === 'NAO OK' || form.testeCura === 'NAO OK' ? "bg-red-500" : "bg-gray-300")}></div>
                  <span>Reprovado / Retido</span>
                </div>
             </div>
          </div>
        </div>

      </div>
      
      <div className="max-w-[1100px] mx-auto mt-4 text-center text-slate-400 text-xs no-print">
        ProInspect Industrial © {new Date().getFullYear()} - Sistema de Gestão da Qualidade
      </div>
    </div>
  );
};

export default App;
