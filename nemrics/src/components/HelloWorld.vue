<template>
<div>
 <v-parallax
    dark
    src="https://dev-nemrics.pantheonsite.io/wp-content/uploads/2021/06/underwater_EDIT-scaled.jpg"
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        class="text-center"
        cols="8"
      >
        <h1 class="text-h4  mb-4">
          Search for maritime research equipment, infrastructure, and capability throughout New England relevant to the Undersea Technology Ecosystem.
        </h1>
        <p>NEMRICS is a product of the joint efforts of the National Institute for Undersea Vehicle Technology (NIUVT), the MITRE Corporation and the University of Connecticut Digital Experience Lab and supported by the US Office of Naval Research.</p>
      </v-col>

      <v-col cols="8" v-if="all_capabilities.length">
        <h3 class="text-h5">Search for Capabilities</h3>
          <v-autocomplete
            :items="all_capabilities"
            item-text="title.rendered"
            color="white"
            
            
            solo
            label="Conduct a search..."
          ></v-autocomplete>
        </v-col>
    </v-row>
  </v-parallax>
  <v-container>
    <v-row>
      <v-col cols="4">
        <h3 class="text-h5">Parent Organizations</h3>
        <v-list>
              <v-list-item v-for="provider in providers" :key="provider.id" @click="getCapabilitiesForProviderId(provider)">
                <v-list-item-content>
                  <v-list-item-title>{{provider.name}} ({{provider.count}})</v-list-item-title>
                  
                </v-list-item-content>
              </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="8">
        <h2 class="text-h5">Capabilities</h2>
        <v-tabs right>
          <v-tab @click="view='list'">
           
             List
          </v-tab>
          <v-tab @click="view='map'">
            
             Map
          </v-tab>
        </v-tabs>
        
        <h4 v-if="activeProvider">{{activeProvider.name}}</h4>

        <v-expansion-panels flat v-if="view == 'list'">
              <v-expansion-panel v-for="capability in capabilities" :key="capability.id">
                <v-expansion-panel-header><h3 v-html="capability.title.rendered"></h3></v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div v-html = "capability.excerpt.rendered"></div>

                  <div class="mapouter" v-if="capability.contact_card">
                    <div class="gmap_canvas">
                      <iframe width="600" height="500" id="gmap_canvas" 
                      :src="`https://maps.google.com/maps?q=${capability.contact_card.address}k&t=&z=13&ie=UTF8&iwloc=
                      &output=embed`" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
</div></div>




                </v-expansion-panel-content>
              </v-expansion-panel>
        </v-expansion-panels>
        <div v-if="view=='map'">
            <iframe width="600" height="500" id="gmap_canvas" 
            :src="`https://maps.google.com/maps?q=${activeProvider.address}k&t=&z=13&ie=UTF8&iwloc=
            &output=embed`" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
        </div>
      </v-col>
    </v-row>
  </v-container>
</div>
</template>

<script>
  export default {
    name: 'HelloWorld',

    data: () => ({
      all_capabilities:[],
      capabilities:[],
      list_page:1,
      total_pages:0,
      providers:[],
      latLongPairsToShow:[],
      activeProvider:null,
      view:"list"
    }),

    methods:{
      getCapabilities:function(extra = "") {
        let that = this;
        let endpoint = `//dev-nemrics.pantheonsite.io/wp-json/wp/v2/capability${extra}`;
        fetch(endpoint)
        .then(function(response) {
           that.total_pages = response.headers.get('X-WP-TotalPages');
           that.total_results = response.headers.get('X-WP-Total');
           return response.json()
        })
        .then(function(data) {
          that.capabilities = [];
          data.forEach(item => {
            that.capabilities.push(item);
            if(typeof item.contact_card != 'undefined'){
              item.contact_card = item.contact_card[0]
            } else {
              item.contact_card = {}
            }            
          });
        }
        );
      },

      getCapabilitiesForProviderId(provider) {
        this.activeProvider = null;
        this.activeProvider = provider;
        console.log(provider.latitude);
        let pid = provider.id;
        this.latLongPairsToShow = [];
        this.latLongPairsToShow.push({"latitude":provider.latitiude, "longitude":provider.longitude});
        this.getCapabilities(`?provider=${pid}&per_page=100&orderby=title&order=asc`)
      },

      getCapabilitiesByTag() {

      },

      getAllProviders:function(extra = ""){
        let that = this;
        let endpoint = `//dev-nemrics.pantheonsite.io/wp-json/wp/v2/provider/${extra}`;
        fetch(endpoint)
        .then(function(response) {
           return response.json()
        })
        .then(data => 
          that.providers = data
        );
      },

      getAllCapabilities: function(page) {
        let that = this;
        let endpoint = `//dev-nemrics.pantheonsite.io/wp-json/wp/v2/capability?per_page=100&orderby=title&order=asc&page=${page}`;
        fetch(endpoint)
        .then(function(response) { 
           that.total_pages = response.headers.get('X-WP-TotalPages');
           that.total_results = response.headers.get('X-WP-Total');
           return response.json()
        })
        .then(function(data) {
          that.all_capabilities = that.all_capabilities.concat(data);
          if(page < that.total_pages)
            that.getAllCapabilities(page+1);
          else {
            console.log(that.all_capabilities);
          }
        }
        );
      }
    },

    mounted() {
      this.getAllProviders("?parent=0&filter[orderby]=name&order=asc");
      this.getAllCapabilities(1);
    }
  }
</script>

<style scoped>
p {
  font-family:'Times New Roman', Times, serif;
  font-size:1.3em;
}
</style>
