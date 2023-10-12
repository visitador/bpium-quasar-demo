<template>
  <div>
    Create order:
    <div v-if="!loading">
      <q-input v-model="comment" label="Comment" outlined />
      <q-btn label="Create Order" color="primary" @click="createOrder" />
      <div>{{ error }}</div>
    </div>
    <div v-else>Creating...</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';
import { useAuthStore } from 'src/stores/auth-store';

const auth = useAuthStore();

const comment = ref('');
const error = ref('');
const loading = ref(false);

const CATALOG_ORDERS_ID = 13;
const ORDER_COMMENT_ID = 3;

async function createOrder() {
  if (!loading.value) {
    try {
      loading.value = true;
      error.value = '';

      await api.post(
        `/api/v1/catalogs/${CATALOG_ORDERS_ID}/records`,
        {
          values: {
            [ORDER_COMMENT_ID]: comment.value,
          },
        },
        {
          auth: {
            username: auth.username,
            password: auth.password,
          },
        }
      );
      comment.value = '';
    } catch (e) {
      error.value = 'Login error';
    } finally {
      loading.value = false;
    }
  }
}
</script>
