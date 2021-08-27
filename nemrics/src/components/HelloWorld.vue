<template>
<div>
 <v-parallax
 height="300"
    dark
    src="https://dev-nemrics.pantheonsite.io/wp-content/uploads/2021/06/underwater_EDIT-scaled.jpg"
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col cols="8" v-if="allTags.length">
        <h3 class="text-h5">Search for Capabilities</h3>
          <v-autocomplete
            :items="allTags"
            item-text="name"
            color="white"
            v-model="tagToSearch"
            @change="getCapabilitiesByTag(tagToSearch.id)"
            solo
            label="Conduct a search..."
            return-object
          ></v-autocomplete>
        </v-col>
    </v-row>
  </v-parallax>
  <v-container fluid>
    <v-row>
      <v-col cols="3">
        <v-toolbar flat>
          <v-toolbar-title>Organizations</v-toolbar-title>
        </v-toolbar>
        <v-list rounded>
            <v-list-item-group v-model="activeProviderIndex">
              <v-list-item v-for="provider in providers" :key="provider.id" @click="getCapabilitiesForProviderId(provider)">
                <v-list-item-content>
                  <v-list-item-title>{{provider.name}}</v-list-item-title>
                  
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>

          <v-list rounded v-if="0">
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

          <v-virtual-scroll height="700" itemHeight="64" :items="capabilities">
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
      <v-col cols="5" v-if="activeCapability">
        <v-toolbar
          flat
        >

          <v-btn
              icon
              class="hidden-xs-only"
              @click="activeCapability = null"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          <v-toolbar-title>Details</v-toolbar-title>

        </v-toolbar>
        <div v-if="activeCapability != null">
          <v-card
              class="mx-auto"
            >
              <v-img
                class="white--text align-end"
                height="200px"
                :src="activeCapability.img ? activeCapability.img : require('@/assets/matt-hardy-6ArTTluciuA-unsplash.jpg')"
              >
                <v-card-title v-html="activeCapability.title.rendered"></v-card-title>
              </v-img>

              <v-card-subtitle class="pb-0">
                {{activeCapability.contact_card.name}}
              </v-card-subtitle>

              <v-card-text class="text--primary">
                <div v-html="activeCapability.excerpt.rendered"></div>
                
                <div v-html="activeCapability.content.rendered"></div>
                <div><strong>Contact name:</strong> {{activeCapability.contact_card.contact_name}}</div>
                 <address v-html="activeCapability.contact_card.address"></address>
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
        </div>
      </v-col>
    </v-row>
  </v-container>
</div>
</template>

<script>

import mapboxgl from "mapbox-gl";
  export default {
    name: 'HelloWorld',
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
      activeCapability:null
    }),

    methods:{
      getCapabilities:function(page = 1) {
        let that = this;
        if(page == 1) {
          that.capabilities = [];
          that.latLongPairsToShow = [];
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
              that.latLongPairsToShow[item.contact_card.id] = {lat:item.contact_card.latitiude, long:item.contact_card.longitude}
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
        this.resultsTab = 0;
        this.activeCapability = null;
        this.getCapabilities();
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
              description: ``
            },
          };
        });
      geojson.features.forEach(function (marker) {
        //console.log('adding marker', marker)
        // create a HTML element for each feature
        var el = document.createElement("div");
        el.className = "marker";
        // make a marker for each feature and add it to the map
        var mkr = new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML(``
            )
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
p {
  font-family:'Times New Roman', Times, serif;
  font-size:1.3em;
}

#mapView{
  height:500px;
}

.marker::before{
    font-family: Material Icons;
    content: "\e8b4";
    color: #333;
    font-size: 40px;
    cursor: pointer;
}
</style>
