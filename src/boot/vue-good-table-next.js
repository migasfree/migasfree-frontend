import VueGoodTablePlugin from "vue-good-table-next";

// import the styles
import "vue-good-table-next/dist/vue-good-table-next.css";

export default async ({ app /*, router, store */ }) => {
  app.use(VueGoodTablePlugin);
};
