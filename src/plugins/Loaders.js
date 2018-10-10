export default {
  // The install method is all that needs to exist on the plugin object.
  // It takes the global Vue object as well as user-defined options.
  install(Vue, store) {
    // We call Vue.mixin() here to inject functionality into all components.
    Vue.mixin({
      data() {
        loaders: store.loaders
      },
      // Anything added to a mixin will be injected into all components.
      // In this case, the mounted() method runs when the component is added to the DOM.
      methods: {
        addLoading(type) {
          if (store.loaders.indexOf(type) == -1)
          store.loaders.push(type)
        },
        removeLoading(type) {
          const pos = store.loaders.indexOf(type)
          if (pos > -1) store.loaders.splice(pos, 1)
        },
        isLoading(type) {
          if (type)
            return store.loaders.indexOf(type) > -1
          return store.loaders.length > 0
        }
      },
      computed: {
        getLoaders() {
          return store.loaders;
        }
      }
    });
  }
};
