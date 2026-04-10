/**
 * @file Servicios de API optimizados - VERSIÓN 2.0
 * Centraliza todas las llamadas a la API relacionadas con productos
 */

// ===== CONFIGURACIÓN =====
const API_URL = 'http://localhost:3000/api';
const DEFAULT_TIMEOUT = 10000; // 10 segundos

// ===== UTILIDADES =====
const createTimeoutPromise = (timeout = DEFAULT_TIMEOUT) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), timeout)
  );

const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La solicitud tardó demasiado');
    }
    throw error;
  }
};

const handleApiError = (error, operation) => {
  console.error(`Error en ${operation}:`, error);
  if (error.message.includes('Timeout')) {
    throw new Error('El servidor está tardando demasiado en responder. Intenta de nuevo.');
  }
  if (error.message.includes('Failed to fetch')) {
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
  }
  throw error;
};

// ===== MOCK DATA =====
const MOCK_PRODUCTOS = [
  // Hamburguesas
  {
    idproducto: 1,
    nombre: 'McRaulo Clásica',
    precio: 8.50,
    categoria: 'hamburguesa',
    descripcion: 'Medallón de carne vacuna, lechuga, tomate, cebolla y salsa especial de la casa.',
    imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
  },
  {
    idproducto: 2,
    nombre: 'Double Bacon',
    precio: 11.00,
    categoria: 'hamburguesa',
    descripcion: 'Doble medallón con tiras de panceta crocante, queso cheddar y salsa BBQ.',
    imagen_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop',
  },
  {
    idproducto: 3,
    nombre: 'Crispy Chicken',
    precio: 9.00,
    categoria: 'hamburguesa',
    descripcion: 'Pollo rebozado crocante, mayonesa de limón, pepino encurtido y pan brioche.',
    imagen_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=400&fit=crop',
  },
  {
    idproducto: 4,
    nombre: 'BBQ Smash',
    precio: 10.50,
    categoria: 'hamburguesa',
    descripcion: 'Smash burger con doble cheddar fundido, cebolla caramelizada y salsa ahumada.',
    imagen_url: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=400&fit=crop',
  },
  {
    idproducto: 5,
    nombre: 'Veggie Burger',
    precio: 8.00,
    categoria: 'hamburguesa',
    descripcion: 'Medallón de lentejas y vegetales, guacamole fresco, rúcula y tomate cherry.',
    imagen_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=400&fit=crop',
  },
  // Papas
  {
    idproducto: 6,
    nombre: 'Papas Clásicas',
    precio: 3.50,
    categoria: 'papa',
    descripcion: 'Papas fritas doradas y crocantes con sal marina. Porción mediana.',
    imagen_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop',
  },
  {
    idproducto: 7,
    nombre: 'Papas con Cheddar',
    precio: 5.00,
    categoria: 'papa',
    descripcion: 'Papas fritas bañadas en salsa de queso cheddar caliente.',
    imagen_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=400&fit=crop',
  },
  {
    idproducto: 8,
    nombre: 'Aros de Cebolla',
    precio: 4.50,
    categoria: 'papa',
    descripcion: 'Aros de cebolla rebozados en tempura crocante. Acompañados de dip de mostaza.',
    imagen_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=400&fit=crop',
  },
  // Bebidas
  {
    idproducto: 9,
    nombre: 'Coca-Cola',
    precio: 2.50,
    categoria: 'bebida',
    descripcion: 'Coca-Cola fría con hielo. Tamaño mediano (500ml).',
    imagen_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
  },
  {
    idproducto: 10,
    nombre: 'Limonada Natural',
    precio: 3.00,
    categoria: 'bebida',
    descripcion: 'Limonada exprimida al momento con menta y hielo. Refrescante y natural.',
    imagen_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop',
  },
  {
    idproducto: 11,
    nombre: 'Milkshake Vainilla',
    precio: 4.50,
    categoria: 'bebida',
    descripcion: 'Batido espeso de vainilla con crema chantilly y sprinkles de colores.',
    imagen_url: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400&h=400&fit=crop',
  },
  // Postres
  {
    idproducto: 12,
    nombre: 'McFlurry Oreo',
    precio: 4.00,
    categoria: 'postre',
    descripcion: 'Helado cremoso mezclado con trozos de galleta Oreo.',
    imagen_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop',
  },
  {
    idproducto: 13,
    nombre: 'Brownie con Helado',
    precio: 5.50,
    categoria: 'postre',
    descripcion: 'Brownie de chocolate tibio con una bocha de helado de vainilla y salsa de caramelo.',
    imagen_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
  },
  // Combos
  {
    idproducto: 14,
    nombre: 'Combo Clásico',
    precio: 13.00,
    categoria: 'combo',
    descripcion: 'McRaulo Clásica + Papas Clásicas + Coca-Cola mediana. El combo perfecto.',
    imagen_url: 'https://images.unsplash.com/photo-1598182198871-d3f4ab4fd181?w=400&h=400&fit=crop',
  },
  {
    idproducto: 15,
    nombre: 'Combo Double',
    precio: 16.50,
    categoria: 'combo',
    descripcion: 'Double Bacon + Papas con Cheddar + Milkshake. Para los que no se conforman con poco.',
    imagen_url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=400&fit=crop',
  },
];

// ===== FUNCIONES PRINCIPALES =====

/**
 * Obtiene todos los productos (mock)
 * @returns {Promise<Array<object>>} Array de productos
 */
export const obtenerProductos = async () => {
  return MOCK_PRODUCTOS;
};

/**
 * Obtiene productos por categoría específica (mock)
 * @param {string} categoria - Nombre de la categoría
 * @returns {Promise<Array<object>>} Array de productos de la categoría
 */
export const obtenerProductosPorCategoria = async (categoria) => {
  return MOCK_PRODUCTOS.filter(p => p.categoria === categoria);
};

/**
 * Obtiene un producto por su ID
 * @param {number|string} id - ID del producto
 * @returns {Promise<object>} Datos del producto
 */
export const obtenerProductoPorId = async (id) => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/productos/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status}: No se pudo obtener el producto.`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error, `obtenerProductoPorId (${id})`);
  }
};

/**
 * Obtiene todas las categorías disponibles
 * @returns {Promise<Array<object>>} Array de categorías
 */
export const obtenerCategorias = async () => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/categorias`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status}: No se pudieron obtener las categorías.`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    handleApiError(error, 'obtenerCategorias');
  }
};

/**
 * Crea un nuevo producto
 * @param {FormData} formData - Datos del producto incluyendo imagen
 * @returns {Promise<object>} Producto creado
 */
export const crearNuevoProducto = async (formData) => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/productos`, {
      method: 'POST',
      body: formData,
      // No establecer Content-Type, el navegador lo hace automáticamente
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status}: No se pudo crear el producto.`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error, 'crearNuevoProducto');
  }
};

/**
 * Actualiza un producto existente
 * @param {number|string} id - ID del producto
 * @param {object} datosProducto - Datos actualizados del producto
 * @returns {Promise<object>} Producto actualizado
 */
export const actualizarProducto = async (id, datosProducto) => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosProducto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status}: No se pudo actualizar el producto.`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error, `actualizarProducto (${id})`);
  }
};

/**
 * Elimina un producto
 * @param {number|string} id - ID del producto a eliminar
 * @returns {Promise<void>}
 */
export const eliminarProducto = async (id) => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status}: No se pudo eliminar el producto.`);
    }

    return; // DELETE no devuelve contenido
  } catch (error) {
    handleApiError(error, `eliminarProducto (${id})`);
  }
};

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Verifica la conectividad con el servidor
 * @returns {Promise<boolean>} True si el servidor está disponible
 */
export const verificarConectividad = async () => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/health`, {}, 5000);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene estadísticas de productos
 * @returns {Promise<object>} Estadísticas de productos
 */
export const obtenerEstadisticas = async () => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/productos/estadisticas`);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: No se pudieron obtener las estadísticas.`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error, 'obtenerEstadisticas');
  }
};

// ===== FUNCIONES DE BÚSQUEDA =====

/**
 * Busca productos por término
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array<object>>} Productos encontrados
 */
export const buscarProductos = async (termino) => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/productos/buscar?q=${encodeURIComponent(termino)}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status}: No se pudo realizar la búsqueda.`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    handleApiError(error, `buscarProductos (${termino})`);
  }
};

// ===== EXPORTACIONES =====
export default {
  obtenerProductos,
  obtenerProductosPorCategoria,
  obtenerProductoPorId,
  obtenerCategorias,
  crearNuevoProducto,
  actualizarProducto,
  eliminarProducto,
  verificarConectividad,
  obtenerEstadisticas,
  buscarProductos,
};