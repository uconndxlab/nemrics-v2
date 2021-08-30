<template>
  <v-app>


    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
      allTags:[],
      tagToSearch:null,
  }),

  methods: {
    getAllTags: function() {
      let that = this;
      let endpoint = "//dev-nemrics.pantheonsite.io/wp-json/wp/v2/tags?per_page=100&orderby=count";
      fetch(endpoint)
      .then(function(response) {
          return response.json()
      })
      .then(function(data) {
        that.allTags = data;
      });
    },
  },

  mounted() {
    //this.getAllTags();
  }
};
</script>

<style scoped>

</style>
