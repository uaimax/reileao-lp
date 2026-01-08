const BioSimpleTest = () => {
  console.log('🚀 BioSimpleTest component mounted');

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      padding: '50px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        🧪 TESTE SIMPLES
      </h1>
      <p style={{ fontSize: '24px', marginBottom: '20px' }}>
        Se você está vendo isso, o React está funcionando!
      </p>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <p>✅ Componente carregado</p>
        <p>✅ Estilos inline funcionando</p>
        <p>✅ Porta: {window.location.port}</p>
      </div>
      <button 
        style={{
          background: 'linear-gradient(45deg, #ff1c8e, #9233ea)',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '25px',
          fontSize: '18px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Botão funcionando!')}
      >
        🎯 TESTE CLIQUE
      </button>
    </div>
  );
};

export default BioSimpleTest;