import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Package, Image, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../api";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

// --- VARIANT ROW COMPONENT ---
const VariantRow = ({ index, variant, onChange, onRemove, isOnly }) => (
  <div className="flex gap-3 items-end">
    <div className="flex-1">
      <label className="text-xs font-medium text-gray-600 mb-1 block">Weight (g)</label>
      <input
        type="number"
        value={variant.weight}
        onChange={(e) => onChange(index, 'weight', e.target.value)}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
        placeholder="e.g. 500"
        min="0"
      />
    </div>
    <div className="flex-1">
      <label className="text-xs font-medium text-gray-600 mb-1 block">Price (₹)</label>
      <input
        type="number"
        value={variant.price}
        onChange={(e) => onChange(index, 'price', e.target.value)}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
        placeholder="e.g. 450"
        min="0"
        step="0.01"
      />
    </div>
    {!isOnly && (
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-3 mb-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={18} />
      </button>
    )}
  </div>
);

// --- PRODUCT FORM MODAL ---
const ProductFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState("");
  const [cut, setCut] = useState("");
  const [img, setImg] = useState("");
  const [tags, setTags] = useState("");
  const [variants, setVariants] = useState([{ id: Date.now(), weight: '', price: '' }]);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setName(initialData.name || '');
      setCut(initialData.cut || '');
      setImg(initialData.img || '');
      setTags(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '');

      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(initialData.variants);
      } else {
        setVariants([{ id: 'v1', weight: initialData.weight, price: initialData.price }]);
      }
    } else {
      setName(''); setCut(''); setImg(''); setTags('');
      setVariants([{ id: Date.now(), weight: '', price: '' }]);
    }
  }, [initialData, isEditMode, isOpen]);

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { id: Date.now(), weight: '', price: '' }]);
  };

  const removeVariant = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (variants.some(v => !v.weight || !v.price)) {
      toast.warn("Please fill in weight and price for all variants.");
      return;
    }

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const productData = {
        name,
        cut,
        img,
        tags: tagsArray,
        variants,
        // For backward compatibility
        weight: variants[0]?.weight || '',
        price: variants[0]?.price || ''
      };

      if (isEditMode) {
        await api.put(`/admin/products/${initialData.id}`, productData);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/admin/products', productData);
        toast.success('Product added successfully!');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save product.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Cut Type
                </label>
                <input
                  type="text"
                  value={cut}
                  onChange={e => setCut(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="e.g. Boneless, With Bone"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Tags
                </label>
                <select
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  required
                  multiple={false}
                >
                  <option value="">Select tags...</option>
                  <option value="Goat, Premium">Goat, Premium</option>
                  <option value="Chicken, Premium">Chicken, Premium</option>
                  <option value="Lamb, Premium">Lamb, Premium</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Image URL
                </label>
                <input
                  type="url"
                  value={img}
                  onChange={e => setImg(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Variants Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <label className="text-lg font-bold text-gray-900">Product Variants</label>
                  <p className="text-sm text-gray-500 mt-1">Add different weight and price combinations</p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 py-2 px-4 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus size={16} /> Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((v, idx) => (
                  <VariantRow
                    key={v.id || idx}
                    index={idx}
                    variant={v}
                    onChange={handleVariantChange}
                    onRemove={removeVariant}
                    isOnly={variants.length === 1}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:from-red-700 hover:to-red-800 transition-all"
              >
                {isEditMode ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- VARIANT DISPLAY COMPONENT ---
const VariantsDisplay = ({ variants, isExpanded, onToggle }) => {
  if (!variants || variants.length === 0) {
    return (
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        No variants available
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-700">
          Variants ({variants.length})
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2 bg-white">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-700">
                    {variant.weight}g
                  </span>
                  <span className="font-bold text-green-600">
                    ₹{variant.price}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MOBILE PRODUCT CARD ---
const MobileProductCard = ({ product, onEdit, onDelete, onToggle }) => {
  const [variantsExpanded, setVariantsExpanded] = useState(false);

  return (
    <div className="p-4 border-b border-gray-100 bg-white hover:bg-gray-50 transition-all duration-200 rounded-lg mb-3 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div className="h-20 w-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border">
          {product.img ? (
            <img
              src={product.img}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${product.img ? 'hidden' : 'flex'}`}>
            <Image className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{product.cut || "Standard Cut"}</p>
            </div>
            <button
              onClick={onToggle}
              className={`ml-2 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${product.is_available ? "bg-red-600" : "bg-gray-300"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.is_available ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.isArray(product.tags) && product.tags.length > 0 ? (
              product.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full border border-blue-100"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">No Tags</span>
            )}
            {product.tags && product.tags.length > 3 && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Price Range */}
          <div className="mt-3">
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-700">Price Range:</span>
                <span className="text-green-600 font-bold">
                  ₹{Math.min(...product.variants.map(v => v.price))} - ₹{Math.max(...product.variants.map(v => v.price))}
                </span>
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="mt-3">
            <VariantsDisplay
              variants={product.variants}
              isExpanded={variantsExpanded}
              onToggle={() => setVariantsExpanded(!variantsExpanded)}
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              <Edit size={16} /> Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DESKTOP PRODUCT ROW ---
const DesktopProductRow = ({ product, onEdit, onDelete, onToggle }) => {
  const [variantsExpanded, setVariantsExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
        {/* Product Info */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden border flex-shrink-0">
              {product.img ? (
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${product.img ? 'hidden' : 'flex'}`}>
                <Image className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate max-w-xs">
                {product.name}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {product.cut || "Standard Cut"}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.isArray(product.tags) && product.tags.length > 0 ? (
                  product.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full border border-blue-100"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">No Tags</span>
                )}
                {product.tags && product.tags.length > 2 && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    +{product.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* Variants Summary */}
        <td className="px-6 py-4">
          <div className="space-y-1">
            {product.variants && product.variants.slice(0, 2).map((variant, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">{variant.weight}g</span>
                <span className="font-semibold text-green-600">₹{variant.price}</span>
              </div>
            ))}
            {product.variants && product.variants.length > 2 && (
              <button
                onClick={() => setVariantsExpanded(!variantsExpanded)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                +{product.variants.length - 2} more variants
              </button>
            )}
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${product.is_available
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
              }`}
          >
            {product.is_available ? "Available" : "Unavailable"}
          </span>
        </td>

        {/* Toggle */}
        <td className="px-6 py-4">
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${product.is_available ? "bg-red-600" : "bg-gray-300"
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.is_available ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Variants Row */}
      {variantsExpanded && product.variants && product.variants.length > 2 && (
        <tr className="bg-gray-50">
          <td colSpan="5" className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {product.variants.map((variant, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{variant.weight}g</span>
                    <span className="font-bold text-green-600">₹{variant.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// --- MAIN PRODUCT MANAGER COMPONENT ---
const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/products");
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleAvailability = async (product) => {
    const newAvailability = !product.is_available;
    setProducts((curr) =>
      curr.map((p) =>
        p.id === product.id ? { ...p, is_available: newAvailability } : p
      )
    );
    try {
      await api.put(`/admin/products/${product.id}/toggle-availability`, {
        is_available: newAvailability,
      });
      toast.success(
        `"${product.name}" is now ${newAvailability ? "available" : "unavailable"}.`
      );
    } catch {
      toast.error("Failed to update product status.");
      setProducts((curr) =>
        curr.map((p) =>
          p.id === product.id ? { ...p, is_available: !newAvailability } : p
        )
      );
    }
  };

  const openAddModal = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (product) => setProductToDelete(product);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/admin/products/${productToDelete.id}`);
      toast.success(`Product "${productToDelete.name}" deleted successfully.`);
      fetchProducts();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to delete product.");
      }
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-10"
    >
      {/* Modals */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={fetchProducts}
        initialData={productToEdit}
      />

      <DeleteConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        itemName={productToDelete?.name}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">
            Manage your products, variants, and availability
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 w-full lg:w-auto"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Products Table/Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Loading State */}
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get started by adding your first product to manage inventory and variants.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 py-3 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={20} /> Add Your First Product
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block lg:hidden">
              <div className="p-4">
                {products.map((product) => (
                  <MobileProductCard
                    key={product.id}
                    product={product}
                    onToggle={() => handleToggleAvailability(product)}
                    onEdit={() => openEditModal(product)}
                    onDelete={() => openDeleteModal(product)}
                  />
                ))}
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Variants
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <DesktopProductRow
                      key={product.id}
                      product={product}
                      onToggle={() => handleToggleAvailability(product)}
                      onEdit={() => openEditModal(product)}
                      onDelete={() => openDeleteModal(product)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProductManager;