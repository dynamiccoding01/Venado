import React, { useState, useEffect } from 'react';
import { Search, Plus, Save, Package, Trash2, Edit2 } from 'lucide-react';
import clsx from 'clsx';
import { API } from '../api/client';
import { Modal } from '../components/common/Modal';

export function CatalogoAdmin() {
  const [activeTab, setActiveTab] = useState('productos'); // productos, categorias
  
  // Categorias
  const [categorias, setCategorias] = useState([]);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);
  
  // Productos
  const [productos, setProductos] = useState([]);
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catFormData, setCatFormData] = useState({ nombre: '', activo: true });
  
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [prodFormData, setProdFormData] = useState({
    id_categoria_producto: '',
    nombre_producto: '',
    sku: '',
    precio_sugerido: '',
    stock_actual: '',
    activo: true
  });
  const [editProdId, setEditProdId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingCategorias(true);
      setIsLoadingProductos(true);
      
      const cats = await API.getCategoriasProductos();
      setCategorias(cats || []);
      setIsLoadingCategorias(false);

      const prods = await API.getProductos();
      setProductos(prods || []);
      setIsLoadingProductos(false);
    } catch (e) {
      console.error("Error loading catalogo data", e);
      setIsLoadingCategorias(false);
      setIsLoadingProductos(false);
    }
  };

  // --- handlers Categorías ---
  const handleSaveCategoria = async () => {
    try {
      await API.createCategoriaProducto(catFormData);
      setIsCatModalOpen(false);
      loadData();
    } catch (e) {
      alert("Error al guardar categoría");
    }
  };

  // --- handlers Productos ---
  const handleOpenProdModal = (prod = null) => {
    if (prod) {
      setEditProdId(prod.id_producto);
      setProdFormData({
        id_categoria_producto: prod.id_categoria_producto || '',
        nombre_producto: prod.nombre_producto || '',
        sku: prod.sku || '',
        precio_sugerido: prod.precio_sugerido || '',
        stock_actual: prod.stock_actual || '',
        activo: prod.activo !== false
      });
    } else {
      setEditProdId(null);
      setProdFormData({
        id_categoria_producto: categorias.length > 0 ? categorias[0].id_categoria_producto : '',
        nombre_producto: '',
        sku: '',
        precio_sugerido: '',
        stock_actual: '',
        activo: true
      });
    }
    setIsProdModalOpen(true);
  };

  const handleSaveProducto = async () => {
    try {
      const data = {
        ...prodFormData,
        id_categoria_producto: parseInt(prodFormData.id_categoria_producto),
        precio_sugerido: parseFloat(prodFormData.precio_sugerido),
        stock_actual: parseFloat(prodFormData.stock_actual)
      };
      
      if (editProdId) {
        await API.updateProducto(editProdId, data);
      } else {
        await API.createProducto(data);
      }
      setIsProdModalOpen(false);
      loadData();
    } catch (e) {
      alert("Error al guardar producto");
    }
  };

  const handleDeleteProducto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await API.deleteProducto(id);
      loadData();
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const filteredProductos = productos.filter(p => 
    p.nombre_producto?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="text-brand-blue" />
            Catálogo y Bodega
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona los productos, su stock global y sus clasificaciones.</p>
        </div>
        
        <div className="flex bg-white dark:bg-dark-card rounded-xl p-1 shadow-sm border border-slate-200 dark:border-dark-border">
          <button 
            onClick={() => setActiveTab('productos')}
            className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'productos' ? "bg-brand-blue text-white shadow-md" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")}
          >
            Productos
          </button>
          <button 
            onClick={() => setActiveTab('categorias')}
            className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'categorias' ? "bg-brand-blue text-white shadow-md" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")}
          >
            Categorías
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border p-4 md:p-6">
        
        {/* TAB PRODUCTOS */}
        {activeTab === 'productos' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por SKU o Nombre..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>
              <button onClick={() => handleOpenProdModal()} className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95">
                <Plus size={18} /> Nuevo Producto
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 font-bold">SKU</th>
                    <th className="p-4 font-bold">Nombre del Producto</th>
                    <th className="p-4 font-bold">Categoría</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold">Precio</th>
                    <th className="p-4 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {isLoadingProductos ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">Cargando productos...</td></tr>
                  ) : filteredProductos.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">No se encontraron productos.</td></tr>
                  ) : (
                    filteredProductos.map(p => {
                       const catName = categorias.find(c => c.id_categoria_producto === p.id_categoria_producto)?.nombre || 'S/C';
                       return (
                        <tr key={p.id_producto} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-mono font-medium text-slate-800 dark:text-slate-300">{p.sku}</td>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{p.nombre_producto}</td>
                          <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">{catName}</span></td>
                          <td className="p-4">
                            <span className={clsx("font-bold", p.stock_actual > 20 ? "text-emerald-500" : "text-red-500")}>
                              {p.stock_actual}
                            </span>
                          </td>
                          <td className="p-4">${p.precio_sugerido?.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleOpenProdModal(p)} className="p-1.5 text-slate-400 hover:text-brand-blue transition-colors rounded"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteProducto(p.id_producto)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CATEGORIAS */}
        {activeTab === 'categorias' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h2 className="text-lg font-bold text-slate-800 dark:text-white">Familias de Productos</h2>
               <button onClick={() => setIsCatModalOpen(true)} className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md">
                 <Plus size={18} /> Nueva Categoría
               </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
               {categorias.map(c => (
                 <div key={c.id_categoria_producto} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                     <Package size={20} />
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800 dark:text-slate-200">{c.nombre}</h3>
                     <p className="text-xs text-slate-500">Activo: {c.activo ? 'Sí' : 'No'}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* MODAL NUEVO PRODUCTO */}
      <Modal isOpen={isProdModalOpen} onClose={() => setIsProdModalOpen(false)} title={editProdId ? "Editar Producto" : "Registrar Producto en Bodega"}>
         <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre del Producto</label>
              <input type="text" value={prodFormData.nombre_producto} onChange={e => setProdFormData({...prodFormData, nombre_producto: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">SKU</label>
                <input type="text" value={prodFormData.sku} onChange={e => setProdFormData({...prodFormData, sku: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                <select value={prodFormData.id_categoria_producto} onChange={e => setProdFormData({...prodFormData, id_categoria_producto: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <option value="">Seleccione...</option>
                  {categorias.map(c => <option key={c.id_categoria_producto} value={c.id_categoria_producto}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Precio Sugerido</label>
                <input type="number" step="0.01" value={prodFormData.precio_sugerido} onChange={e => setProdFormData({...prodFormData, precio_sugerido: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Stock Actual (Global)</label>
                <input type="number" step="any" value={prodFormData.stock_actual} onChange={e => setProdFormData({...prodFormData, stock_actual: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsProdModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm">Cancelar</button>
              <button onClick={handleSaveProducto} className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-md">
                <Save size={18} /> Guardar
              </button>
            </div>
         </div>
      </Modal>

      {/* MODAL NUEVA CATEGORIA */}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Nueva Familia de Productos">
         <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre de la Categoría</label>
              <input type="text" value={catFormData.nombre} onChange={e => setCatFormData({...catFormData, nombre: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm">Cancelar</button>
              <button onClick={handleSaveCategoria} className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-md">
                <Save size={18} /> Guardar
              </button>
            </div>
         </div>
      </Modal>

    </div>
  );
}
