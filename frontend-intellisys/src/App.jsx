import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Moon, Sun, Plus, Trash, Edit, X, ExternalLink, Globe, Upload } from 'lucide-react';

// CONFIGURAÇÃO DA API (trocar para a URL correta para rodar em produção)
const API_BASE_URL = 'http://localhost:8080'; 

const api = axios.create({
  baseURL: API_BASE_URL, 
});

function App() {
  // ESTADOS
  const [theme, setTheme] = useState('light');
  const [shortcuts, setShortcuts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  // Dados do atalho (texto)
  const [shortcutData, setShortcutData] = useState({ id: null, name: '', url: '', image_url: '' });
  
  const [selectedFile, setSelectedFile] = useState(null);

  // EFEITOS (Tema escuro/claro)
  useEffect(() => {
    fetchShortcuts();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // FUNÇÕES
  const fetchShortcuts = async () => {
    try {
      const response = await api.get('/shortcut');
      setShortcuts(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar atalhos", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', loginData);
      const jwt = response.data.token;
      setToken(jwt);
      localStorage.setItem('token', jwt);
      setIsLoginOpen(false);
      alert("Login realizado com sucesso!");
    } catch (error) {
      alert("Usuário ou senha inválidos");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const handleSaveShortcut = async (e) => {
    e.preventDefault();
    
    const config = { 
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        } 
    };

    const formData = new FormData();
    formData.append('name', shortcutData.name);
    formData.append('url', shortcutData.url);
    
    if (selectedFile) {
        formData.append('image', selectedFile);
    } else {
        if (shortcutData.image_url) {
            formData.append('image_url', shortcutData.image_url);
        }
    }

    try {
      if (shortcutData.id) {
        await api.put(`/shortcut/${shortcutData.id}`, formData, config);
      } else {
        await api.post('/shortcut', formData, config);
      }
      
      fetchShortcuts();
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique se está logado.");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    try {
      await api.delete(`/shortcut/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchShortcuts();
    } catch (error) {
      alert("Erro ao deletar.");
    }
  };

  const openEdit = (item) => {
    setShortcutData({ ...item, image_url: item.image_url || '' });
    setSelectedFile(null); 
    setIsEditModalOpen(true);
  };

  const openNew = () => {
    setShortcutData({ id: null, name: '', url: '', image_url: '' });
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
      setIsEditModalOpen(false);
      setShortcutData({ id: null, name: '', url: '', image_url: '' });
      setSelectedFile(null);
  }

  // Se for link externo (http...), usa direto. 
  // Se for caminho relativo (/uploads...), adiciona a URL da API antes.
  const getImageUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return `${API_BASE_URL}${path}`;
  };

  // URL DO SITE DA EMPRESA
  const COMPANY_SITE_URL = "http://www.intellisys.com.br/BRPT/index.awp"; 

  // RENDERIZAÇÃO
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center p-6 bg-white dark:bg-gray-800 shadow-md gap-4">
        
        {/* LOGO HEADER */}
        <div className="text-4xl select-none" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
          <span className="text-black dark:text-white">Intelli</span>
          <span className="text-red-600">sys</span>
        </div>

        <div className="flex items-center gap-6">
          <a 
            href={COMPANY_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition font-medium"
            title="Ir para o site da empresa"
          >
            <Globe size={20} />
            <span className="hidden sm:inline">Site IntelliSys</span>
          </a>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            {theme === 'light' ? <Moon className="text-gray-700" /> : <Sun className="text-yellow-400" />}
          </button>

          {token ? (
             <div className="flex items-center gap-2">
               <button onClick={handleLogout} className="text-sm text-red-500 font-semibold hover:underline">Sair</button>
             </div>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <Settings className="text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Nossos Clientes</h2>
          {token && (
            <button onClick={openNew} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition">
              <Plus size={18} /> Novo Atalho
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shortcuts.map((shortcut) => (
            <div 
              key={shortcut.id} 
              onClick={() => window.open(shortcut.url, '_blank')}
              className="cursor-pointer relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 border-red-600 group flex flex-col h-full"
            >
              
              {/* ÁREA DA LOGO */}
              <div className="h-24 w-full mb-4 flex items-center justify-center">
                {shortcut.image_url ? (
                  <img 
                    src={getImageUrl(shortcut.image_url)} 
                    alt={`Logo ${shortcut.name}`} 
                    className="h-full w-full object-contain" 
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-500 dark:text-gray-300 select-none">
                      {shortcut.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{shortcut.name}</h3>
              
              {/* Tranforma o Link em um span visual, já que o card todo é o link agora */}
              <span className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1 mb-4 truncate">
                <ExternalLink size={14}/> Acessar Sistema
              </span>

              <div className="mt-auto"></div>

              {token && (
                <div className="flex justify-end gap-2 mt-4 border-t pt-2 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 3. Adicionado e.stopPropagation() para não abrir o site ao clicar nos botões */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEdit(shortcut); }} 
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(shortcut.id); }} 
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* MODAL LOGIN */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-96 relative">
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
              <X />
            </button>
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">Acesso Administrativo</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="text" 
                placeholder="Usuário" 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={loginData.username}
                onChange={e => setLoginData({...loginData, username: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Senha" 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
              />
              <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Entrar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR/NOVO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-96 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
              <X />
            </button>
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">
              {shortcutData.id ? 'Editar Atalho' : 'Novo Atalho'}
            </h2>
            <form onSubmit={handleSaveShortcut} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">Nome do Cliente</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={shortcutData.name}
                  onChange={e => setShortcutData({...shortcutData, name: e.target.value})}
                  required
                />
              </div>
              
              {/* MUDANÇA: Input de Upload de Imagem */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Logo (Imagem)</label>
                
                {/* Visualização do nome do arquivo atual ou selecionado */}
                <div className="flex items-center gap-2 mb-2">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm transition">
                        <Upload size={16} /> Escolher Arquivo
                        <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setSelectedFile(e.target.files[0]);
                                }
                            }}
                        />
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        {selectedFile ? selectedFile.name : (shortcutData.image_url ? 'Imagem atual mantida' : 'Nenhum arquivo')}
                    </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">URL do Sistema</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={shortcutData.url}
                  onChange={e => setShortcutData({...shortcutData, url: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;