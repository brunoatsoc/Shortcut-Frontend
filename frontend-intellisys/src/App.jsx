import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Moon, Sun, Plus, Trash, Edit, X, ExternalLink, Globe, Upload } from 'lucide-react';

// TESTE
const API_BASE_URL = 'http://localhost:8080/api/v1';
const STATIC_BASE_URL = 'http://localhost:8080';
// FIM TESTE

/*
// PRODUÇÃO
const API_BASE_URL = '/api/v1';
const STATIC_BASE_URL = '';
// FIM PRODUÇÃO
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
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
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
    if (selectedFile) formData.append('image', selectedFile);

    try {
      if (shortcutData.id) {
        await api.put(`/admin/${shortcutData.id}`, formData);
      } else {
        await api.post('/admin', formData);
      }
      fetchShortcuts();
      closeModal();
    } catch (error) {
      alert("Erro ao salvar.");
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
    setShortcutData({ ...item, link: item.link || '' });
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

  const ShortcutCard = ({ shortcut }) => (
    <div 
      onClick={() => shortcut.link && window.open(shortcut.link, '_blank')}
      className="cursor-pointer relative bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-red-600 group flex flex-col h-full"
    >
      <div className="h-20 w-full mb-3 flex items-center justify-center">
        {shortcut.image_url && shortcut.image_url.trim() !== "" ? (
          <img src={getImageUrl(shortcut.image_url)} alt={shortcut.name} className="h-full w-full object-contain" />
        ) : (
          <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800/50 rounded-full flex items-center justify-center">
            <span className="text-2xl font-black text-red-600 dark:text-red-500">
              {shortcut.name ? shortcut.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 truncate" title={shortcut.name}>{shortcut.name}</h3>
      <span className="text-blue-500 text-sm flex items-center gap-1 mb-3">
        <ExternalLink size={14}/> Acessar
      </span>

      <div className="mt-auto"></div>

      {user && (
        <div className="flex justify-end gap-3 mt-4 border-t pt-3 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); openEdit(shortcut); }} className="p-1 text-gray-400 hover:text-blue-500"><Edit size={18} /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(shortcut.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash size={18} /></button>
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
            <button onClick={() => setIsLoginOpen(true)} className="p-2 text-gray-400 hover:text-red-600 transition"><Settings size={22}/></button>
          )}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL - Largura de 1440px */}
      <main className="p-8 max-w-[1440px] mx-auto space-y-16">
        
        {/* SEÇÃO 1: SOLUÇÕES INTELLISYS */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b pb-4 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white leading-none">Soluções Intellisys</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Acesso rápido aos sistemas e ferramentas internas</p>
            </div>
            {user && (
              <button onClick={() => openNew('INTERNAL_LINK')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition active:scale-95">
                <Plus size={18} /> Nova Solução
              </button>
            )}
          </div>
          {/* Grid Estreita: 6 colunas em telas XL */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {shortcuts.filter(s => s.shortcut_type === 'INTERNAL_LINK').map(s => <ShortcutCard key={s.id} shortcut={s} />)}
          </div>
        </section>

        {/* SEÇÃO 2: LINKS DE CLIENTES */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b pb-4 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white leading-none">Portais Personalizados</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Acesso rápido aos portais personalizados de clientes</p>
            </div>
            {user && (
              <button onClick={() => openNew('CLIENT_LINK')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition active:scale-95">
                <Plus size={18} /> Novo Link de Cliente
              </button>
            )}
          </div>
          {/* Grid Estreita: 6 colunas em telas XL */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {shortcuts.filter(s => s.shortcut_type === 'CLIENT_LINK').map(s => <ShortcutCard key={s.id} shortcut={s} />)}
          </div>
        </section>
      </main>

      {/* MODAL EDITAR/NOVO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-1 dark:text-white text-center">{shortcutData.id ? 'Editar' : 'Novo'}</h2>
            <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-6">Seção: {shortcutData.shortcut_type === 'INTERNAL_LINK' ? 'Soluções' : 'Clientes'}</p>
            <form onSubmit={handleSaveShortcut} className="space-y-5">
              <input type="text" placeholder="Nome" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={shortcutData.name} onChange={e => setShortcutData({...shortcutData, name: e.target.value})} required />
              <label className="w-full cursor-pointer flex flex-col items-center justify-center py-6 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-red-500 transition-colors">
                <Upload className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-500 truncate px-4">{selectedFile ? selectedFile.name : "Logo/Imagem"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
              </label>
              <input type="text" placeholder="https://..." className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={shortcutData.link} onChange={e => setShortcutData({...shortcutData, link: e.target.value})} required />
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition">Salvar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-80 relative">
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">Login Admin</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" placeholder="Nome" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white" value={loginData.name} onChange={e => setLoginData({...loginData, name: e.target.value})} required />
              <input type="password" placeholder="Senha" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required />
              <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Entrar</button>
              <button type="button" onClick={() => setIsLoginOpen(false)} className="w-full text-sm text-gray-500 mt-2">Voltar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;