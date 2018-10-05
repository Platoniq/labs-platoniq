<script>
import L from 'leaflet'

export default {
  data() {
    return {
      footprints: [],
      sdgs: [],
      loading: [],
      clusterOptionsProject: {
        iconCreateFunction(cluster) {
          let n = cluster.getChildCount()
          return L.divIcon({ html: '<div><span>'+n+'</span></div>', className: 'marker-cluster marker-cluster-project', iconSize: L.point(40, 40) });
        }
      },
      clusterOptionsPayment: {
        iconCreateFunction(cluster) {
          let n = cluster.getAllChildMarkers().reduce((acc,curr) => acc + parseInt(curr && curr.options && curr.options.alt) || 0, 0)
          return L.divIcon({ html: '<div><span>'+n+'€</span></div>', className: 'marker-cluster marker-cluster-payment', iconSize: L.point(40, 40) });
        }
      },
      clusterOptionsSignature: {
        disableClusteringAtZoom: 17,
        iconCreateFunction(cluster) {
          let n = cluster.getChildCount()
          return L.divIcon({ html: '<div><span>'+n+'</span></div>', className: 'marker-cluster marker-cluster-signature', iconSize: L.point(40, 40) });
        }
      },
      url:'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
    }
  },
  methods: {
    getIcon(type, ob) {
      let ops ={
        iconSize: [38, 38]
      }
      // if(type === 'project') ops.iconUrl = 'static/img/pin-project.svg'
      if(type === 'project') {
        ops.iconUrl = ob['image-url']
        ops.className = 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive image-project'
      }
      if(type === 'signature') ops.iconUrl = 'static/img/pin-signature.svg'

      // if(type === 'euro') ops.iconUrl = 'static/img/pin-payment.svg'
      if(type === 'euro') {
        return L.divIcon({ html: '<div><span>' + ob.amount +'€</span></div>', className: 'marker-cluster marker-cluster-payment', iconSize: L.point(40, 40) });
      }
      return L.icon(ops)
    },
  }

}
</script>
