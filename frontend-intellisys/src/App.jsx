import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Moon, Sun, Plus, Trash, Edit, X, ExternalLink, Globe, Upload } from 'lucide-react';


// TESTE
const API_BASE_URL = 'http://localhost:8080/api/v1';
const STATIC_BASE_URL = 'http://localhost:8080';
// TESTE

/*
// PRODUÇÃO
const API_BASE_URL = '/api/v1';
const STATIC_BASE_URL = '';
// PRODUÇÃO
*/

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

function App() {
  const [theme, setTheme] = useState('light');
  const [shortcuts, setShortcuts] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loginData, setLoginData] = useState({ name: '', password: '' });
  
  // Estado do formulário - valor inicial padrão como INTERNAL_LINK
  const [shortcutData, setShortcutData] = useState({ id: null, name: '', link: '', shortcut_type: 'INTERNAL_LINK' });
  const [selectedFile, setSelectedFile] = useState(null);

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

  const fetchShortcuts = async () => {
    try {
      const response = await api.get('/shortcuts');
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
      const response = await api.post('/auth/login', loginData);
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoginOpen(false);
    } catch (error) {
      alert("Usuário ou senha inválidos");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleSaveShortcut = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', shortcutData.name);
    formData.append('link', shortcutData.link);
    formData.append('shortcut_type', shortcutData.shortcut_type);
    
    if (selectedFile) {
        formData.append('image', selectedFile);
    }

    try {
      if (shortcutData.id) {
        await api.put(`/admin/${shortcutData.id}`, formData);
      } else {
        await api.post('/admin', formData);
      }
      fetchShortcuts();
      closeModal();
    } catch (error) {
      alert("Erro ao salvar. Verifique se sua sessão ainda é válida.");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    try {
      await api.delete(`/admin/${id}`);
      fetchShortcuts();
    } catch (error) {
      alert("Erro ao deletar.");
    }
  };

  const openEdit = (item) => {
    setShortcutData({ 
        id: item.id, 
        name: item.name, 
        link: item.link || '', 
        shortcut_type: item.shortcut_type 
    });
    setSelectedFile(null); 
    setIsEditModalOpen(true);
  };

  const openNew = (type) => {
    setShortcutData({ id: null, name: '', link: '', shortcut_type: type });
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
      setIsEditModalOpen(false);
      setSelectedFile(null);
  }

  const getImageUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return `${STATIC_BASE_URL}${path}`;
  };

  // COMPONENTE DO CARD (Reutilizável)
  // COMPONENTE DO CARD (Versão Compacta)
  const ShortcutCard = ({ shortcut }) => (
    <div 
      onClick={() => shortcut.link && window.open(shortcut.link, '_blank')}
      // Alterado: p-6 -> p-4 (reduz o respiro interno)
      className="cursor-pointer relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-red-600 group flex flex-col h-full"
    >
      {/* ÁREA DA LOGO - Alterado: h-24 -> h-16 e mb-4 -> mb-2 */}
      <div className="h-16 w-full mb-2 flex items-center justify-center">
        {shortcut.image_url && shortcut.image_url.trim() !== "" ? (
          <img src={getImageUrl(shortcut.image_url)} alt={shortcut.name} className="h-full w-full object-contain" />
        ) : (
          // Reduzi o tamanho do círculo da inicial também para combinar
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800/50 rounded-full flex items-center justify-center shadow-inner">
            <span className="text-2xl font-black text-red-600 dark:text-red-500 select-none">
              {shortcut.name ? shortcut.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        )}
      </div>

      {/* Título - mb-2 -> mb-1 */}
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 truncate">{shortcut.name}</h3>
      
      {/* Link - mb-4 -> mb-2 */}
      <span className="text-blue-500 hover:text-blue-400 text-xs flex items-center gap-1 mb-2 truncate">
        <ExternalLink size={12}/> Acessar Sistema
      </span>

      <div className="mt-auto"></div>

      {user && (
        // Reduzi o mt-4 -> mt-2 e pt-3 -> pt-2
        <div className="flex justify-end gap-2 mt-2 border-t pt-2 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={(e) => { e.stopPropagation(); openEdit(shortcut); }} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
            <Edit size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(shortcut.id); }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
            <Trash size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center p-6 bg-white dark:bg-gray-800 shadow-md gap-4">
        <div className="text-4xl select-none" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
          <span className="text-black dark:text-white">Intelli</span><span className="text-red-600">sys</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            {theme === 'light' ? <Moon className="text-gray-700" /> : <Sun className="text-yellow-400" />}
          </button>

          {user ? (
             <div className="flex items-center gap-4">
               <span className="text-sm font-medium dark:text-gray-300">Olá {user.name}</span>
               <button onClick={handleLogout} className="text-sm text-red-500 font-semibold hover:underline">Sair</button>
             </div>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <Settings className="text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-16">
        
        {/* SEÇÃO 1: SOLUÇÕES INTELLISYS (INTERNAL_LINK) */}
        <section>
          <div className="flex justify-between items-center mb-8 border-b pb-4 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Soluções Intellisys</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sistemas e ferramentas internas</p>
            </div>
            {user && (
              <button onClick={() => openNew('INTERNAL_LINK')} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow-lg transition transform active:scale-95">
                <Plus size={18} /> Nova Solução
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {shortcuts
              .filter(s => s.shortcut_type === 'INTERNAL_LINK')
              .map(s => <ShortcutCard key={s.id} shortcut={s} />)
            }
          </div>
        </section>

        {/* SEÇÃO 2: LINKS DE CLIENTES (CLIENT_LINK) */}
        <section>
          <div className="flex justify-between items-center mb-8 border-b pb-4 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Links de Clientes</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Acesso rápido aos portais de clientes</p>
            </div>
            {user && (
              <button onClick={() => openNew('CLIENT_LINK')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg transition transform active:scale-95">
                <Plus size={18} /> Novo Link de Cliente
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {shortcuts
              .filter(s => s.shortcut_type === 'CLIENT_LINK')
              .map(s => <ShortcutCard key={s.id} shortcut={s} />)
            }
          </div>
        </section>
      </main>

      {/* MODAL EDITAR/NOVO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative mx-4">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-2 dark:text-white text-center">
              {shortcutData.id ? 'Editar Atalho' : 'Novo Atalho'}
            </h2>
            <p className="text-center text-xs font-semibold mb-6 text-gray-500 uppercase tracking-widest">
              Seção: {shortcutData.shortcut_type === 'INTERNAL_LINK' ? 'Soluções' : 'Clientes'}
            </p>

            <form onSubmit={handleSaveShortcut} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Cliente/Sistema</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={shortcutData.name}
                  onChange={e => setShortcutData({...shortcutData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo (Imagem)</label>
                <div className="flex flex-col items-center gap-3">
                    <label className="w-full cursor-pointer flex flex-col items-center justify-center py-6 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 transition-colors">
                        <Upload className="text-gray-400 mb-2" size={24} />
                        <span className="text-sm text-gray-500">{selectedFile ? selectedFile.name : "Clique para fazer upload"}</span>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }}
                        />
                    </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link de Destino</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={shortcutData.link}
                  onChange={e => setShortcutData({...shortcutData, link: e.target.value})}
                  required
                />
              </div>

              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-500/30 transition-all transform active:scale-95">
                Salvar Atalho
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-80 relative">
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">Login Admin</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" placeholder="Usuário" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={loginData.name} onChange={e => setLoginData({...loginData, name: e.target.value})} required />
              <input type="password" placeholder="Senha" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required />
              <button type="submit" className="w-full bg-gray-900 dark:bg-white dark:text-black text-white py-3 rounded-xl font-bold">Entrar</button>
              <button type="button" onClick={() => setIsLoginOpen(false)} className="w-full text-sm text-gray-500 mt-2">Fechar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;