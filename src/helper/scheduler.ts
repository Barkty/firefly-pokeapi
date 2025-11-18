import cron from 'node-cron';
import cacheManager from '../utils/cache-manager';

// Clear all Pokemon details cache every 6 hours
cron.schedule('0 */6 * * *', () => {
  cacheManager.invalidatePokemonDetails();
  logger.info('Pokemon details cache invalidated');
});

// Clear list cache every hour
cron.schedule('0 * * * *', () => {
  cacheManager.deletePattern('pokemon:list:*');
  logger.info('Pokemon list cache invalidated');
});