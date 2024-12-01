import { createWebHistory, createRouter, Router } from "vue-router";

import Field from "../pages/Field.vue";
import Home from "../pages/Home.vue";

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/field",
      name: "field",
      component: Field,
    },
  ],
});

export default router;

