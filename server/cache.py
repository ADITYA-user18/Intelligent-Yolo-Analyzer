# server/cache.py
import redis.asyncio as redis
import os
import json
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class RedisCache:
    def __init__(self):
        self.client = None
        self.use_memory = False
        self._memory_cache = {}

    async def connect(self):
        if not self.client:
            try:
                self.client = redis.from_url(REDIS_URL, decode_responses=True)
                # Test connection (timeout quickly)
                await self.client.ping()
                print("Redis Cache Connected")
                self.use_memory = False
            except Exception as e:
                print(f"Redis Connection Failed: {e}")
                print("IQ-Fallback: Using In-Memory Cache (Sessions won't persist after restart)")
                self.client = None
                self.use_memory = True

    async def close(self):
        if self.client:
            await self.client.close()
            print("Redis Cache Disconnected")

    async def get_session(self, session_id):
        if self.use_memory:
            return self._memory_cache.get(f"session:{session_id}")
            
        if not self.client: return None
        try:
            data = await self.client.get(f"session:{session_id}")
            return json.loads(data) if data else None
        except Exception:
            return self._memory_cache.get(f"session:{session_id}")

    async def set_session(self, session_id, session_data, ttl=3600):
        # Update memory as insurance
        cache_data = {k: v for k, v in session_data.items() if k != "_id"}
        self._memory_cache[f"session:{session_id}"] = cache_data
        
        if self.use_memory or not self.client: return
        try:
            await self.client.set(f"session:{session_id}", json.dumps(cache_data), ex=ttl)
        except Exception:
            self.use_memory = True

    async def invalidate_session(self, session_id):
        self._memory_cache.pop(f"session:{session_id}", None)
        if not self.client or self.use_memory: return
        try:
            await self.client.delete(f"session:{session_id}")
        except Exception:
            pass

    async def get_latest_session_key(self, user_id):
        if self.use_memory:
            return self._memory_cache.get(f"user_latest:{user_id}")
            
        if not self.client: return None
        try:
            return await self.client.get(f"user_latest:{user_id}")
        except Exception:
            return self._memory_cache.get(f"user_latest:{user_id}")

    async def invalidate_latest_session_key(self, user_id):
        self._memory_cache.pop(f"user_latest:{user_id}", None)
        if not self.client or self.use_memory: return
        try:
            await self.client.delete(f"user_latest:{user_id}")
        except Exception:
            pass

    async def set_latest_session_key(self, user_id, session_id):
        self._memory_cache[f"user_latest:{user_id}"] = session_id
        if self.use_memory or not self.client: return
        try:
            await self.client.set(f"user_latest:{user_id}", session_id, ex=86400) # 24h
        except Exception:
            self.use_memory = True

cache = RedisCache()
