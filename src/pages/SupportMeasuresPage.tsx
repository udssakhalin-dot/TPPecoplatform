import { useState, useEffect } from 'react';
import { Search, Filter, ArrowRight, Banknote, GraduationCap, Percent, Building2 } from 'lucide-react';
import api from '../services/api';

interface SupportMeasure {
  id: number;
  title: string;
  description: string;
  type: 'SUBSIDY' | 'GRANT' | 'LOAN' | 'EDUCATION';
  amount?: string;
  provider: string;
  deadline?: string;
}

export function SupportMeasuresPage() {
  const [measures, setMeasures] = useState<SupportMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    api.get('/support-measures')
      .then(res => setMeasures(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredMeasures = measures.filter(measure => {
    const matchesSearch = measure.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          measure.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || measure.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUBSIDY': return <Percent className="h-6 w-6 text-emerald-600" />;
      case 'GRANT': return <Banknote className="h-6 w-6 text-blue-600" />;
      case 'LOAN': return <Building2 className="h-6 w-6 text-purple-600" />;
      case 'EDUCATION': return <GraduationCap className="h-6 w-6 text-amber-600" />;
      default: return <Banknote className="h-6 w-6 text-slate-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SUBSIDY': return 'Субсидия';
      case 'GRANT': return 'Грант';
      case 'LOAN': return 'Кредит';
      case 'EDUCATION': return 'Обучение';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUBSIDY': return 'bg-emerald-50 text-emerald-700';
      case 'GRANT': return 'bg-blue-50 text-blue-700';
      case 'LOAN': return 'bg-purple-50 text-purple-700';
      case 'EDUCATION': return 'bg-amber-50 text-amber-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Меры государственной поддержки</h1>
        <p className="text-lg text-slate-600">
          Актуальные программы финансирования, гранты и образовательные проекты для развития вашего бизнеса.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по мерам поддержки..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select 
            className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 py-2 pl-3 pr-10"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Все типы</option>
            <option value="SUBSIDY">Субсидии</option>
            <option value="GRANT">Гранты</option>
            <option value="LOAN">Кредиты</option>
            <option value="EDUCATION">Обучение</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeasures.length > 0 ? (
          filteredMeasures.map((measure) => (
            <div key={measure.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getTypeColor(measure.type)}`}>
                    {getTypeLabel(measure.type)}
                  </div>
                  {measure.amount && (
                    <span className="text-sm font-semibold text-slate-900">{measure.amount}</span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">{measure.title}</h3>
                <p className="text-slate-600 mb-4 text-sm line-clamp-3">{measure.description}</p>
                
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{measure.provider}</span>
                  </div>
                  {measure.deadline && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">Срок:</span>
                      <span>до {measure.deadline}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                <button className="w-full flex items-center justify-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  Подробнее <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">Меры поддержки не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
