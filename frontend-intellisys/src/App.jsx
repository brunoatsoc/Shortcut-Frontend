import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Settings, Moon, Sun, Plus, Trash, Edit, X, ExternalLink, Globe, Upload } from 'lucide-react';

// CONFIGURAÇÃO DA API - Adicionado o prefixo /api/v1 conforme seu Router Go
const API_BASE_URL = 'http://localhost:8080/api/v1';
const STATIC_BASE_URL = 'http://localhost:8080'; // Para carregar as imagens de /uploads

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ESSENCIAL: Permite que o navegador envie/receba o Cookie access_token
});

function App() {
  // ESTADOS
  const [theme, setTheme] = useState('light');
  const [shortcuts, setShortcuts] = useState([]);
  
  // Como agora usamos Cookies, o 'user' no localStorage serve apenas para controle de UI (ex: mostrar botão excluir)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   
  const [loginData, setLoginData] = useState({ name: '', password: '' }); // 'username' alterado para 'name'
  
  // shortcut_type adicionado conforme seu DTO
  const [shortcutData, setShortcutData] = useState({ id: null, name: '', link: '', shortcut_type: 'CLIENT_LINK' });
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

  // FUNÇÕES
  const fetchShortcuts = async () => {
    try {
      // Rota pública: /shortcuts
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
      // Rota atualizada: /auth/login
      const response = await api.post('/auth/login', loginData);
      const userData = response.data.user;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoginOpen(false);
      alert("Login realizado com sucesso!");
    } catch (error) {
      alert("Usuário ou senha inválidos");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Obs: O cookie HttpOnly continuará no navegador até expirar ou você criar uma rota de logout no backend
  };

  const handleSaveShortcut = async (e) => {
    e.preventDefault();
    
    // O backend agora recebe multipart/form-data
    const formData = new FormData();
    formData.append('name', shortcutData.name);
    formData.append('link', shortcutData.link); // Campo alterado de 'url' para 'link'
    formData.append('shortcut_type', shortcutData.shortcut_type);
    
    if (selectedFile) {
        formData.append('image', selectedFile);
    }

    try {
      // Rotas administrativas agora ficam sob /admin
      if (shortcutData.id) {
        await api.put(`/admin/${shortcutData.id}`, formData);
      } else {
        await api.post('/admin', formData);
      }
      
      fetchShortcuts();
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique se sua sessão ainda é válida.");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    try {
      // Rota administrativa: DELETE /admin/:id
      await api.delete(`/admin/${id}`);
      fetchShortcuts();
    } catch (error) {
      alert("Erro ao deletar.");
    }
  };

  const openEdit = (item) => {
    // Mapeando do ResponseDTO para o estado do formulário
    setShortcutData({ 
        id: item.id, 
        name: item.name, 
        link: item.link || '', 
        shortcut_type: 'CLIENT_LINK' 
    });
    setSelectedFile(null); 
    setIsEditModalOpen(true);
  };

  const openNew = () => {
    setShortcutData({ id: null, name: '', link: '', shortcut_type: 'CLIENT_LINK' });
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
      return `${STATIC_BASE_URL}${path}`; // Concatena com a raiz (ex: http://localhost:8080/uploads/...)
  };

  const COMPANY_SITE_URL = "http://www.intellisys.com.br/BRPT/index.awp"; 

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center p-6 bg-white dark:bg-gray-800 shadow-md gap-4">
        <div className="text-4xl select-none" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
          <span className="text-black dark:text-white">Intelli</span>
          <span className="text-red-600">sys</span>
        </div>

        <div className="flex items-center gap-6">
          <a 
            href={COMPANY_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition font-medium"
          >
            <Globe size={20} />
            <span className="hidden sm:inline">Site IntelliSys</span>
          </a>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Soluções Intellisys</h2>
          {user && (
            <button onClick={openNew} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition">
              <Plus size={18} /> Novo Atalho
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {shortcuts.map((shortcut) => (
    <div 
      key={shortcut.id} 
      // O clique em qualquer lugar do quadrado dispara o link
      onClick={() => shortcut.link && window.open(shortcut.link, '_blank')}
      className="cursor-pointer relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-red-600 group flex flex-col h-full"
    >
      
      {/* ÁREA DA LOGO */}
      <div className="h-24 w-full mb-4 flex items-center justify-center">
        {shortcut.image_url && shortcut.image_url.trim() !== "" ? (
          <img 
            src={getImageUrl(shortcut.image_url)} 
            alt={shortcut.name} 
            className="h-full w-full object-contain" 
          />
        ) : (
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800/50 rounded-full flex items-center justify-center shadow-inner">
            <span className="text-3xl font-black text-red-600 dark:text-red-500 select-none">
              {shortcut.name ? shortcut.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{shortcut.name}</h3>
      
      <span className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1 mb-4">
        <ExternalLink size={14}/> Acessar Sistema
      </span>

      {/* Espaçador para empurrar os botões para o final */}
      <div className="mt-auto"></div>

      {/* ÁREA DE BOTÕES ADMIN */}
      {user && (
        <div className="flex justify-end gap-3 mt-4 border-t pt-3 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            title="Editar atalho"
            onClick={(e) => { 
              e.stopPropagation(); // IMPEDE que o link abra ao clicar aqui
              openEdit(shortcut); 
            }} 
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button 
            title="Excluir atalho"
            onClick={(e) => { 
              e.stopPropagation(); // IMPEDE que o link abra ao clicar aqui
              handleDelete(shortcut.id); 
            }} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                value={loginData.name}
                onChange={e => setLoginData({...loginData, name: e.target.value})}
                required
              />
              <input 
                type="password" 
                placeholder="Senha" 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
                required
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
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Logo (Imagem)</label>
                <div className="flex items-center gap-2 mb-2">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded text-sm transition">
                        <Upload size={16} /> Escolher Arquivo
                        <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }}
                        />
                    </label>
                    <span className="text-xs text-gray-500 truncate max-w-[150px]">
                        {selectedFile ? selectedFile.name : 'Nenhum arquivo'}
                    </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">Link do Sistema</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={shortcutData.link}
                  onChange={e => setShortcutData({...shortcutData, link: e.target.value})}
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