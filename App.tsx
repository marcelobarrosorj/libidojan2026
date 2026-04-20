import React, { useState } from 'react';

function App() {
  // Estado para controlar se o usuário está logado
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Estado para simular hover nos botões
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Função para simular login
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Função para simular cadastro
  const handleCadastro = () => {
    setIsLoggedIn(true);
  };

  // Estilos inline compactos
  const containerStyle: React.CSSProperties
