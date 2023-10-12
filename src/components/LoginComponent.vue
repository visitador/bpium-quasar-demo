<template>
  <div>
    <div v-if="!auth.loggedIn">
      Login for subdomain.bpium.ru:
      <div v-if="!auth.loading">
        <q-input v-model="user" label="Username" outlined />
        <q-input v-model="pass" label="Password" outlined />
        <q-btn label="Sign-in" @click="signIn" />
      </div>
      <div v-else>Loading...</div>
      <div>{{ auth.error }}</div>
    </div>
    <div v-else>
      Logged in as {{ auth.username }}
      <q-btn label="Logout" @click="auth.logout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';

const auth = useAuthStore();

const user = ref('');
const pass = ref('');
async function signIn() {
  auth.signIn(user.value, pass.value);
}
</script>
