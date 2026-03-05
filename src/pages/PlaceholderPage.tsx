import { Link } from 'react-router-dom';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
      <p className="text-slate-600 mb-8 max-w-md">
        Этот раздел находится в разработке. Мы работаем над тем, чтобы сделать его максимально полезным для вашего бизнеса.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
