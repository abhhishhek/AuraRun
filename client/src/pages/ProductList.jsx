import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, setFilters } from "../redux/productSlice";
import ProductCard from "../components/product/ProductCard";
import api from "../utils/api";

const SORTS = [
  {label:"Newest",value:"newest"},
  {label:"Price: Low to High",value:"price-asc"},
  {label:"Price: High to Low",value:"price-desc"},
  {label:"Top Rated",value:"rating"},
];

export default function ProductList() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { items, loading, filters, total, page, pages } = useSelector((s) => s.products);
  const [categories, setCategories] = useState(["All"]);
  const [brandFilter, setBrandFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(20000);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const search = params.get("search") || "";
    const category = params.get("category") || filters.category;
    const pageParam = Number(params.get("page") || filters.page || 1);
    const brand = params.get("brand") || brandFilter;
    const size = params.get("size") || sizeFilter;
    dispatch(fetchProducts({ ...filters, search, category, page: pageParam, brand, size, minPrice: priceMin, maxPrice: priceMax }));
  }, [filters, params, brandFilter, sizeFilter, priceMin, priceMax]);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) {
          setCategories(["All", ...data.map((c) => c.name)]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(stored);
    } catch {}
  }, []);

  const setFilter = (key, val) => {
    dispatch(setFilters({ [key]: val, page: 1 }));
    if (key === "category") { setParams(val ? {category:val} : {}); }
  };

  const goToPage = (p) => {
    if (p < 1 || p > pages) return;
    dispatch(setFilters({ page: p }));
    const category = params.get("category") || filters.category;
    const search = params.get("search") || filters.search || "";
    const next = {};
    if (category) next.category = category;
    if (search) next.search = search;
    if (brandFilter) next.brand = brandFilter;
    if (sizeFilter) next.size = sizeFilter;
    next.page = String(p);
    setParams(next);
  };

  const brands = Array.from(new Set(items.map((p) => p.brand).filter(Boolean)));
  const sizes = Array.from(new Set(items.flatMap((p) => p.sizes || []))).filter(Boolean);
  const searchSuggestions = Array.from(new Set(items.map((p) => p.name))).slice(0, 6);
  const recentTop = recentlyViewed[0];
  const becauseViewed = useMemo(() => {
    if (!recentTop) return [];
    return items.filter((p) => p._id !== recentTop._id && (p.category === recentTop.category || p.brand === recentTop.brand)).slice(0, 4);
  }, [items, recentTop]);
  const popularInSize = useMemo(() => {
    if (!sizeFilter) return [];
    return items.filter((p) => (p.sizes || []).includes(sizeFilter)).slice(0, 4);
  }, [items, sizeFilter]);

  return (
    <div className="section">
      <div className="container">
        <div style={{marginBottom:"32px"}}>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"2.2rem",marginBottom:"6px"}}>
            {params.get("search") ? `Results for "${params.get("search")}"` : "All Products"}
          </h1>
          <p style={{color:"var(--text-muted)"}}>{total} products found</p>
        </div>

        <div className="filters-layout">
          {/* Sidebar */}
          <aside className="filters-panel">
            <div className="filter-group">
              <div className="filter-label">Search</div>
              <input
                list="product-suggestions"
                className="form-input"
                style={{height:"36px",padding:"0 10px",fontSize:"0.8rem"}}
                placeholder="Search products"
                value={filters.search}
                onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
              />
              <datalist id="product-suggestions">
                {searchSuggestions.map((name) => <option key={name} value={name} />)}
              </datalist>
            </div>
            <div className="filter-group">
              <div className="filter-label">Category</div>
              {categories.map((c) => (
                <div key={c} className="filter-option" onClick={() => setFilter("category", c === "All" ? "" : c)}>
                  <input type="radio" readOnly checked={filters.category === (c === "All" ? "" : c)} />
                  <span>{c}</span>
                </div>
              ))}
            </div>
            <div className="filter-group">
              <div className="filter-label">Brand</div>
              <select
                className="form-input"
                style={{height:"36px",padding:"0 10px",fontSize:"0.8rem"}}
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  dispatch(setFilters({ page: 1 }));
                  const next = {};
                  if (filters.category) next.category = filters.category;
                  if (filters.search) next.search = filters.search;
                  if (e.target.value) next.brand = e.target.value;
                  setParams(next);
                }}
              >
                <option value="">All brands</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <div className="filter-label">Size</div>
              <select
                className="form-input"
                style={{height:"36px",padding:"0 10px",fontSize:"0.8rem"}}
                value={sizeFilter}
                onChange={(e) => {
                  setSizeFilter(e.target.value);
                  dispatch(setFilters({ page: 1 }));
                  const next = {};
                  if (filters.category) next.category = filters.category;
                  if (filters.search) next.search = filters.search;
                  if (brandFilter) next.brand = brandFilter;
                  if (e.target.value) next.size = e.target.value;
                  setParams(next);
                }}
              >
                <option value="">All sizes</option>
                {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <div className="filter-label">Price Range</div>
              <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"10px"}}>
                <input className="form-input" style={{height:"36px",padding:"0 10px",fontSize:"0.8rem"}}
                  placeholder="Min" type="number" value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))} />
                <span style={{color:"var(--text-muted)"}}>–</span>
                <input className="form-input" style={{height:"36px",padding:"0 10px",fontSize:"0.8rem"}}
                  placeholder="Max" type="number" value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))} />
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
              />
            </div>
            <div className="filter-group">
              <div className="filter-label">Sort By</div>
              {SORTS.map((s) => (
                <div key={s.value} className="filter-option" onClick={() => setFilter("sort", s.value)}>
                  <input type="radio" readOnly checked={filters.sort === s.value} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div>
            {loading ? (
              <div className="product-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="product-skeleton card">
                    <div className="product-skeleton-image" />
                    <div className="product-skeleton-body">
                      <div className="product-skeleton-line" />
                      <div className="product-skeleton-line short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length ? (
              <div className="product-grid">
                {items.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-illustration">Empty</div>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <h3>No products found</h3>
                <p>Try adjusting your filters or browse our best sellers.</p>
                <button className="btn-primary" onClick={() => {
                  setBrandFilter("");
                  setSizeFilter("");
                  setPriceMin(0);
                  setPriceMax(20000);
                  dispatch(setFilters({ search: "", category: "", sort: "newest", page: 1 }));
                  setParams({});
                }}>
                  Reset filters
                </button>
              </div>
            )}
            {(becauseViewed.length > 0 || popularInSize.length > 0) && (
              <div className="personalized-strip">
                {becauseViewed.length > 0 && (
                  <div className="personalized-block">
                    <div className="personalized-title">Because you viewed {recentTop?.name}</div>
                    <div className="personalized-grid">
                      {becauseViewed.map((p) => <ProductCard key={p._id} product={p} />)}
                    </div>
                  </div>
                )}
                {popularInSize.length > 0 && (
                  <div className="personalized-block">
                    <div className="personalized-title">Popular in your size</div>
                    <div className="personalized-grid">
                      {popularInSize.map((p) => <ProductCard key={p._id} product={p} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!loading && pages > 1 && (
              <div className="pagination">
                <button className="btn-secondary" onClick={() => goToPage(page - 1)} disabled={page === 1}>Prev</button>
                <span>Page {page} of {pages}</span>
                <button className="btn-secondary" onClick={() => goToPage(page + 1)} disabled={page === pages}>Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
