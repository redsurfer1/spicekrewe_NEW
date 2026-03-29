import { useEffect, useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const module = await import('../data/products.json');
        const data = module.default as Product[];
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load products.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sk-md bg-red-50 border border-sk-card-border p-6 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
          aria-hidden
        />
        <label htmlFor="product-grid-search" className="sr-only">
          Search products by name
        </label>
        <input
          id="product-grid-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spice-purple focus:border-transparent text-gray-900 placeholder-gray-500"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-600 py-12">
          {searchQuery.trim()
            ? `No products match "${searchQuery}".`
            : 'No products available.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="bg-white rounded-sk-md border border-sk-card-border shadow-sm overflow-hidden hover:shadow-md hover:border-spice-purple/20 transition-all duration-200"
            >
              <div className="p-5">
                <span className="text-xs font-medium text-spice-purple uppercase tracking-wide">
                  {product.category}
                </span>
                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {product.description}
                </p>
                <p className="mt-4 text-spice-purple font-bold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
