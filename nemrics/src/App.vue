<template>
  <v-app>
    <v-app-bar
      app
      color="white"
      
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('@/assets/logo.png')"
          transition="scale-transition"
          width="120"
        />


      </div>

      <v-spacer></v-spacer>

      <v-btn
        to="/about"
        text
      >
        <span class="mr-2">About NEMRICS</span>
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    //
  }),
};
</script>
