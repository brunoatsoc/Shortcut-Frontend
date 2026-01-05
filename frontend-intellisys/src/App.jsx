import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Moon, Sun, Plus, Trash, Edit, X, ExternalLink, Globe } from 'lucide-react';

// --- CONFIGURAÇÃO DA API ---
const api = axios.create({
  baseURL: 'http://localhost:8080', 
});

function App() {
  // --- ESTADOS ---
  const [theme, setTheme] = useState('light');
  const [shortcuts, setShortcuts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [shortcutData, setShortcutData] = useState({ id: null, name: '', url: '', image_url: '' });

  // --- EFEITOS ---
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

  // --- FUNÇÕES ---
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
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (shortcutData.id) {
        await api.put(`/shortcut/${shortcutData.id}`, shortcutData, config);
      } else {
        const { id, ...newShortcut } = shortcutData; 
        await api.post('/shortcut', newShortcut, config);
      }
      fetchShortcuts();
      setIsEditModalOpen(false);
      setShortcutData({ id: null, name: '', url: '', image_url: '' });
    } catch (error) {
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
    setIsEditModalOpen(true);
  };

  const openNew = () => {
    setShortcutData({ id: null, name: '', url: '', image_url: '' });
    setIsEditModalOpen(true);
  };

  // --- URL DO SITE DA EMPRESA ---
  const COMPANY_SITE_URL = "http://www.intellisys.com.br/BRPT/index.awp"; 

  // --- RENDERIZAÇÃO ---
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 font-sans">
      
      {/* --- HEADER --- */}
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

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Atalhos dos Clientes</h2>
          {token && (
            <button onClick={openNew} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition">
              <Plus size={18} /> Novo Atalho
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.id} className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 border-red-600 group flex flex-col h-full">
              
              {/* --- ÁREA DA LOGO (Sem bordas, limpa) --- */}
              <div className="h-24 w-full mb-4 flex items-center justify-center">
                {shortcut.image_url ? (
                  // LOGO: Fundo transparente, sem bordas
                  <img 
                    src={shortcut.image_url} 
                    alt={`Logo ${shortcut.name}`} 
                    className="h-full w-full object-contain" 
                  />
                ) : (
                  // LETRA: Dentro de um círculo suave para não ficar "solta"
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-500 dark:text-gray-300 select-none">
                      {shortcut.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{shortcut.name}</h3>
              <a 
                href={shortcut.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1 mb-4 truncate"
              >
                <ExternalLink size={14}/> Acessar Sistema
              </a>

              <div className="mt-auto"></div>

              {token && (
                <div className="flex justify-end gap-2 mt-4 border-t pt-2 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(shortcut)} className="p-1 text-gray-500 hover:text-blue-500">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(shortcut.id)} className="p-1 text-gray-500 hover:text-red-500">
                    <Trash size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* --- MODAL LOGIN --- */}
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

      {/* --- MODAL EDITAR/NOVO --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-96 relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
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
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">URL da Logo (Imagem)</label>
                <input 
                  type="text" 
                  placeholder="http://site.com/logo.png"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={shortcutData.image_url}
                  onChange={e => setShortcutData({...shortcutData, image_url: e.target.value})}
                />
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