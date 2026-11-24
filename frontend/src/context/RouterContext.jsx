import React, { createContext, useContext, useState, useEffect } from "react";

const RouterContext = createContext({
  currentRoute: "/",
  navigate: () => {},
  router: {
    invalidate: async () => {},
    options: {
      context: {
        queryClient: {
          cancelQueries: async () => {},
          clear: () => {},
        },
      },
    },
  },
});

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = ({ to, replace } = {}) => {
    if (to) {
      setCurrentRoute(to);
      if (replace) {
        window.history.replaceState({}, "", to);
      } else {
        window.history.pushState({}, "", to);
      }
    }
  };

  const router = {
    invalidate: async () => {},
    options: {
      context: {
        queryClient: {
          cancelQueries: async () => {},
          clear: () => {},
        },
      },
    },
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate, router }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  return ctx ? ctx.navigate : () => {};
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  return (
    ctx?.router ?? {
      invalidate: async () => {},
      options: {
        context: {
          queryClient: {
            cancelQueries: async () => {},
            clear: () => {},
          },
        },
      },
    }
  );
}

export function useCurrentRoute() {
  const ctx = useContext(RouterContext);
  return ctx ? ctx.currentRoute : "/";
}
