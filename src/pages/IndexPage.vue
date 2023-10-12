<template>
  <q-page class="row items-center justify-evenly">
    <login-component />
    <create-order v-if="auth.loggedIn" />
  </q-page>
</template>

<script setup lang="ts">
import LoginComponent from 'src/components/LoginComponent.vue';
import CreateOrder from 'src/components/CreateOrder.vue';
import { useAuthStore } from 'src/stores/auth-store';

const auth = useAuthStore();
</script>
