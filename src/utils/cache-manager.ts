import NodeCache from "node-cache";

export const CACHE_CONFIG = {
  SHORT: 5 * 60, 
  MEDIUM: 30 * 60,
  LONG: 2 * 60 * 60,
  EXTENDED: 6 * 60 * 60
};

// Cache key prefixes for organization
export const CACHE_KEYS = {
  POKEMON_LIST: 'pokemon:list',
  POKEMON_DETAIL: 'pokemon:detail',
  POKEMON_SPECIES: 'pokemon:species',
  FAVORITES: 'favorites',
  USER_DATA: 'user',
};

export class CacheManager {
  private cache: NodeCache;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(ttl: number = CACHE_CONFIG.MEDIUM) {
    this.cache = new NodeCache({
      stdTTL: ttl,
      checkperiod: 120,
      useClones: false,
      deleteOnExpire: true,
      maxKeys: 1000,
    });

    // Log cache events
    this.cache.on('expired', (key, _value) => {
      logger.info(`Cache key expired: ${key}`, {trace: 'cache.manager.ts'});
    });

    this.cache.on('del', (key, _value) => {
      logger.debug(`Cache key deleted: ${key}`, {trace: 'cache.manager.ts'});
    });

    logger.info('Cache manager initialized', {trace: 'cache.manager.ts'});
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    
    if (value !== undefined) {
      this.hitCount++;
      logger.debug(`Cache hit: ${key}`, {trace: 'cache.manager.ts'});
    } else {
      this.missCount++;
      logger.debug(`Cache miss: ${key}`, {trace: 'cache.manager.ts'});
    }
    
    return value;
  }

  /**
   * Set value in cache with optional custom TTL
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl || 0);
    
    if (success) {
      logger.debug(`Cache set: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`, {trace: 'cache.manager.ts'});
    }
    
    return success;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): number {
    const deleted = this.cache.del(key);
    logger.debug(`Cache deleted: ${key}`, {trace: 'cache.manager.ts'});
    return deleted;
  }

  /**
   * Delete keys matching a pattern (e.g., "pokemon:detail:*")
   */
  deletePattern(pattern: string): number {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    const matchingKeys = keys.filter(key => regex.test(key));
    
    if (matchingKeys.length > 0) {
      const deleted = this.cache.del(matchingKeys);
      logger.info(`Deleted ${deleted} cache keys matching pattern: ${pattern}`, {trace: 'cache.manager.ts'});
      return deleted;
    }
    
    return 0;
  }

  /**
   * Invalidate all Pokemon detail caches
   */
  invalidatePokemonDetails(): number {
    return this.deletePattern(`${CACHE_KEYS.POKEMON_DETAIL}:*`);
  }

  /**
   * Invalidate specific Pokemon cache
   */
  invalidatePokemon(name: string): number {
    return this.delete(`${CACHE_KEYS.POKEMON_DETAIL}:${name}`);
  }

  /**
   * Invalidate user-specific caches
   */
  invalidateUserCache(userId: string): number {
    return this.deletePattern(`${CACHE_KEYS.USER_DATA}:${userId}:*`);
  }

  /**
   * Invalidate favorites cache
   */
  invalidateFavorites(userId?: string): number {
    if (userId) {
      return this.delete(`${CACHE_KEYS.FAVORITES}:${userId}`);
    }
    return this.deletePattern(`${CACHE_KEYS.FAVORITES}:*`);
  }

  /**
   * Clear entire cache
   */
  flush(): void {
    this.cache.flushAll();
    this.hitCount = 0;
    this.missCount = 0;
    logger.info('Cache flushed', {trace: 'cache.manager.ts'});
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = this.cache.getStats();
    const hitRate = this.hitCount + this.missCount > 0
      ? ((this.hitCount / (this.hitCount + this.missCount)) * 100).toFixed(2)
      : '0.00';

    return {
      ...stats,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get remaining TTL for a key (in seconds)
   */
  getTTL(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  /**
   * Update TTL for existing key
   */
  updateTTL(key: string, ttl: number): boolean {
    return this.cache.ttl(key, ttl);
  }

  /**
   * Get all keys
   */
  getKeys(): string[] {
    return this.cache.keys();
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.keys().length;
  }

  /**
   * Close cache
   */
  close(): void {
    this.cache.close();
    logger.info('Cache manager closed', {trace: 'cache.manager.ts'});
  }
}

// Singleton instance
export const cacheManager = new CacheManager(CACHE_CONFIG.MEDIUM);

// Helper functions for common cache operations
export const CacheHelpers = {
  /**
   * Get or set cache with a fetcher function
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = cacheManager.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch and cache
    try {
      const data = await fetcher();
      cacheManager.set(key, data, ttl);
      return data;
    } catch (error) {
      logger.error(`Error fetching data for cache key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Cache Pokemon list with pagination info
   */
  cachePokemonList(offset: number, limit: number, data: any, ttl = CACHE_CONFIG.SHORT) {
    const key = `${CACHE_KEYS.POKEMON_LIST}:${offset}:${limit}`;
    return cacheManager.set(key, data, ttl);
  },

  /**
   * Get cached Pokemon list
   */
  getPokemonList(offset: number, limit: number) {
    const key = `${CACHE_KEYS.POKEMON_LIST}:${offset}:${limit}`;
    return cacheManager.get(key);
  },

  /**
   * Cache Pokemon details
   */
  cachePokemonDetail(name: string, data: any, ttl = CACHE_CONFIG.LONG) {
    const key = `${CACHE_KEYS.POKEMON_DETAIL}:${name.toLowerCase()}`;
    return cacheManager.set(key, data, ttl);
  },

  /**
   * Get cached Pokemon details
   */
  getPokemonDetail(name: string) {
    const key = `${CACHE_KEYS.POKEMON_DETAIL}:${name.toLowerCase()}`;
    return cacheManager.get(key);
  },

  /**
   * Cache user favorites
   */
  cacheFavorites(userId: string, favorites: any[], ttl = CACHE_CONFIG.SHORT) {
    const key = `${CACHE_KEYS.FAVORITES}:${userId}`;
    return cacheManager.set(key, favorites, ttl);
  },

  /**
   * Get cached favorites
   */
  getFavorites(userId: string) {
    const key = `${CACHE_KEYS.FAVORITES}:${userId}`;
    return cacheManager.get(key);
  },
};

export default cacheManager;