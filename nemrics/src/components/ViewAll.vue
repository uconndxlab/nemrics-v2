<template>
<div>
    <v-app-bar
      app
      
      prominent
      src="https://dev-nemrics.pantheonsite.io/wp-content/uploads/2021/06/underwater_EDIT-scaled.jpg"
    >
      <div class="d-flex align-center">
        <!-- <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('@/assets/logo.png')"
          transition="scale-transition"
          width="120"
        /> -->


      </div>
      <v-container fluid class="header-container">
        <v-row>
        <v-col cols="10">  
          
                <v-autocomplete
                  clearable
                  item-text="name"
                  color="white"
                  solo
                  label="Conduct a search..."
                  :items="allTags"
                  v-model="tagToSearch"
                  @change="getCapabilitiesByTag()"
                  return-object
                >
                 <template slot="selection" slot-scope="data">
                    <!-- HTML that describe how select should render selected items -->
                    <strong> Capability Type: </strong> &nbsp; {{data.item.name}}
                  </template>
                  <template slot="item" slot-scope="data">
                    <!-- HTML that describe how select should render items when the select is open -->
                           <v-badge color="info" :content="data.item.count">{{ data.item.name }} </v-badge>
                  </template> 
                
                
                </v-autocomplete>
        </v-col>
        <v-spacer></v-spacer>
        <v-col right>
            <v-btn
              dark
              to="/about"
              text
            >
              About NEMRICS
              <v-icon>mdi-information</v-icon>
            </v-btn>
        </v-col>
              </v-row>
      </v-container>
    </v-app-bar>



  <v-container fluid>
    <v-row>
      <v-col cols="3">
        <v-toolbar flat>
          <v-toolbar-title>Organizations</v-toolbar-title>
        </v-toolbar>
        <v-list>
            <v-list-item-group v-model="activeProviderIndex">
              <v-list-item v-for="provider in providers" :key="provider.id" @click="getCapabilitiesForProviderId(provider)">
                <v-list-item-content>
                  <v-list-item-title>{{provider.name}}</v-list-item-title>
                  
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>

          <v-list v-if="0">
            <v-subheader>Tags</v-subheader>

              <v-list-item-group
        v-model="activeTagIndex" >


                <v-list-item v-for="tag in allTags" :key="tag.id" @click="getCapabilitiesByTag(tag.id)">
                  
                  <v-list-item-content>
                    <v-list-item-title>{{tag.name}} ({{tag.count}})</v-list-item-title>
                    
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
          </v-list>

        
      </v-col>
      <v-col>
        <v-toolbar
          flat
        >
          <v-toolbar-title>Capabilities ({{capabilities.length}})</v-toolbar-title>
            <template v-slot:extension>
                <v-tabs
                  v-model="resultsTab"
                  
                >
                  <v-tabs-slider color="primary"></v-tabs-slider>
                  <v-tab>
                    List View
                  </v-tab>
                  <v-tab>
                    Map View
                  </v-tab>
                </v-tabs>
              </template>
        </v-toolbar>
          <v-chip
            class="ma-2"
            v-if="activeProvider"
            close
            @click:close="removeActiveProvider"
          >
            {{activeProvider.name}}
          </v-chip>

          <v-chip
            class="ma-2"
            v-if="tagToSearch"
            close
            @click:close="removeActiveTag"
          >
            {{tagToSearch.name}}
          </v-chip>  
    <v-tabs-items v-model="resultsTab">
      <v-tab-item>

          <v-virtual-scroll  height="700" itemHeight="64" :items="capabilities">
            <template v-slot:default="{ item }">
              
              <v-list-item @click="displayItem(item)" two-line :key="item.id">
                <v-list-item-content>
                  <v-list-item-title v-html="item.title.rendered"></v-list-item-title>
                  <v-list-item-subtitle v-if="item.contact_card" v-html="item.contact_card.name"></v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon>
                    <v-icon color="grey lighten-1">mdi-chevron-right</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              
            </template>
          </v-virtual-scroll>
      </v-tab-item>
    <v-tab-item>
<div id="mapView"></div>
    </v-tab-item>
    </v-tabs-items>
      </v-col>

    </v-row>


<v-dialog
      v-model="showSingleCapability"
      width="800"
      transition="dialog-bottom-transition"
    >

          <v-card v-if="showSingleCapability"
              class="mx-auto"
            >

              <v-toolbar
                flat
                color="rgba(0, 0, 0, 0)"
              >

                <v-btn
                    icon
                    class="hidden-xs-only"
                    @click="activeCapability = null;showSingleCapability=false;"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                <v-toolbar-title v-html="activeCapability.title.rendered"></v-toolbar-title>

              </v-toolbar>



                 <iframe width="800" height="450" style="border:0; max-width:100%;" loading="lazy" allowfullscreen
:src="`https://maps.google.com/maps?q=${activeCapability.contact_card.address}&t=&z=13&ie=UTF8&iwloc=&output=embed`"></iframe>
              <v-card-text class="text--primary">

                <div v-html="activeCapability.excerpt.rendered"></div>
                
                <div v-html="activeCapability.content.rendered"></div>
                <v-card-subtitle>
                <strong>Offered by:</strong> <span v-html="activeCapability.contact_card.name"></span>
                </v-card-subtitle>
                <v-card-subtitle>
                  <div><strong>Contact name:</strong> {{activeCapability.contact_card.contact_name}}</div>
                </v-card-subtitle>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  :href="activeCapability.contact_card.website"
                  text
                >
                  website
                </v-btn>

                <v-btn
                  text
                  :href='`mailto:${activeCapability.contact_card.contact_email}`'
                  v-html='activeCapability.contact_card.contact_email'
                >
                  
                </v-btn>
              </v-card-actions>
            </v-card>
    </v-dialog>

    <v-bottom-sheet v-model="showSingleContactCard" hide-overlay persistent>
      <v-sheet
        class="text-center"
        height="200px"
      >
        <v-btn
          class="mt-6"
          text
          color="red"
          @click="showSingleContactCard = !showSingleContactCard"
        >
          close
        </v-btn>
        <h5>{{contact_card_content.title}}</h5>
        <div class="py-3">
          View matching capabilities: <v-btn text @click="resultsTab=0; showSingleContactCard = false;">View Matching Capabilities</v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>

  </v-container>
</div>
</template>

<script>
// This is a lazy catch-all component for testing features and filtering. 
// I'm using it as the home view for now while I work on other stuff
// Sincerely, @joelsalisbury 2 days before demo day...
import mapboxgl from "mapbox-gl";
  export default {
    name: 'default-view',
    components: {
      
    },

    data: () => ({
      all_capabilities:[],
      capabilities:[],
      list_page:1,
      total_pages:0,
      providers:[],
      latLongPairsToShow:[],
      activeProvider:null,
      activeProviderIndex:Number,
      allTags:[],
      tagToSearch:null,
      activeTagIndex:Number,
      view:"list",
      accessToken: "pk.eyJ1Ijoiam9lbHVjb25uIiwiYSI6ImNrc3VtNDBndTFod3MybnFrbDRxN2EybHYifQ.2_iHqtCV_x6T78U4JD293g", // your access token. Needed if you using Mapbox maps
      mapStyle: "mapbox://styles/mapbox/streets-v11", // your map style
      map: null,
      mapMarkers:[],
      resultsTab:1,
      activeCapability:null,
      showSingleCapability:false,
      showSingleContactCard: false,
      contact_card_content:{}
    }),

    methods:{
      getCapabilities:function(page = 1) {
        let that = this;
        if(page == 1) {
          that.capabilities = [];
          that.latLongPairsToShow = [];
          that.activeCapability = null;
        }
        let endpoint = `//dev-nemrics.pantheonsite.io/wp-json/wp/v2/capability?_embed=true&${this.queryString}&page=${page}`;
        fetch(endpoint)
        .then(function(response) {
           that.total_pages = response.headers.get('X-WP-TotalPages');
           that.total_results = response.headers.get('X-WP-Total');
           return response.json()
        })
        .then(function(data) {
          
          data.forEach(item => {
            //that.capabilities.push(item);
            if(item.contact_card.length > 0){
              item.contact_card = item.contact_card[0]
              that.latLongPairsToShow[item.contact_card.id] = {id: item.contact_card.id, name:item.contact_card.name,lat:item.contact_card.latitiude, long:item.contact_card.longitude}
            } else {
              item.contact_card = {}
            }            
          });
          that.populateMap();
          

          that.capabilities = that.capabilities.concat(data);
          if(page < that.total_pages)
            that.getCapabilities(page+1);
          else {
            if(that.capabilities.length == 0)
              that.capabilities = data;
          }
        }
        );
      },

      getAllTags: function() {
        let that = this;
        let endpoint = "//dev-nemrics.pantheonsite.io/wp-json/wp/v2/tags?per_page=100";
        fetch(endpoint)
        .then(function(response) {
           return response.json()
        })
        .then(function(data) {
          that.allTags = data;
        });
      },

      getCapabilitiesForProviderId(provider) {
        if(this.activeProvider !== provider) {
          this.activeProvider = provider;
          // this.latLongPairsToShow = [];
          // this.latLongPairsToShow.push({"latitude":provider.latitiude, "longitude":provider.longitude});
          
          this.getCapabilities();
          
          
          
        }
        else {
          this.activeProvider = null;
          this.capabilities = this.all_capabilities;
        }
        
      },

      getCapabilitiesByTag() {
        // function made obsolete when we went stateful but whatever
        //this.resultsTab = 0;
        this.activeCapability = null;
        this.getCapabilities();        

      },

      getContactCard(mkr) {
        this.showSingleContactCard = true;
        this.contact_card_content = mkr.properties;
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

      removeActiveTag: function(){
        this.activeTagIndex = null;
        this.activeTag = null;
        this.tagToSearch = null;
        this.activeCapability = null;
        this.getCapabilities();
      },

      removeActiveProvider: function() {
        this.activeProvider = null;
        this.activeProviderIndex = null;
        this.activeCapability = null;
        this.getCapabilities();
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
            if(that.capabilities.length == 0)
              that.capabilities = that.all_capabilities;
          }
        }
        );
      },

      displayItem(item) {
        console.log(item);
        this.showSingleCapability = true;
        this.activeCapability = item;
        
      },

      initMap: function() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9lbHVjb25uIiwiYSI6ImNrc3VtNDBndTFod3MybnFrbDRxN2EybHYifQ.2_iHqtCV_x6T78U4JD293g';
        var map = new mapboxgl.Map({
          container: 'mapView',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-72.253983, 41.807739],
          zoom: 5,
        });

        this.map = map;
      },

      populateMap: function(){

        var that = this;

        if (that.mapMarkers!==null) {
            for (var i = that.mapMarkers.length - 1; i >= 0; i--) {
              that.mapMarkers[i].remove();
            }
        }

        let geojson = {
          type: "FeatureCollection",
          features: [],
        };



        geojson.features = this.latLongPairsToShow.map((wp) => {
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [wp.long, wp.lat],
            },
            properties: {
              title: `${wp.name}`,
              id:`${wp.id}`
            },
          };
        });
      geojson.features.forEach(function (marker) {
        //console.log('adding marker', marker)
        // create a HTML element for each feature
        var el = document.createElement("div");
        el.className = "marker";
        el.addEventListener("click", function(){
          //that.activeProvider = marker.properties.id;
          that.getContactCard(marker);
        });
        // make a marker for each feature and add it to the map
        var mkr = new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML(`
                <h3>${marker.properties.title}</h3>
                
              `)
          )
          .addTo(that.map);

          that.mapMarkers.push(mkr);
      });
        
      }


    },

    mounted() {
      this.getAllProviders("?parent=0&filter[orderby]=name&order=asc");
      this.getAllTags();
      this.getCapabilities(1);
      this.initMap();
      //this.getAllCapabilities(1);

    },

    computed:{
      queryString: function (){
        let str;
        
        if(this.tagToSearch != null) {
          str += `&tags=${this.tagToSearch.id}`;
        }

        if(this.activeProvider != null) {
          str += `&provider=${this.activeProvider.id}`
        }
        str += `&per_page=100&orderby=title&order=asc`

        return str;
      }
    }
  }
</script>

<style>
/* p {
  font-family:'Times New Roman', Times, serif;
  font-size:1.3em;
} */

#mapView{
  height:500px;
  width:100%;
}

.marker::before{
    font-family: Material Icons;
    content: "\e8b4";
    color: #333;
    font-size: 40px;
    cursor: pointer;
}

.col {
  transition: all 2s;
}

.mapboxgl-popup-close-button {
    width: 20px;
    height: 20px;
    font-size: 18px; 
}

  .header-container {
    margin-top:25px;
  }
</style>
