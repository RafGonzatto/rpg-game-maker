export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Página de Teste</h1>
        <p className="text-lg">Se você está vendo esta página, o Next.js está funcionando!</p>
        <p className="text-sm text-gray-600 mt-2">
          Timestamp: {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}
