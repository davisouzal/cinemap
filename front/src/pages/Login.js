import React, { useEffect, useState } from "react";
import { useSignIn } from "react-auth-kit";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Loading from "../components/Loading/Loanding";

import { useRef } from "react";
import { Toast } from "primereact/toast";

//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";
//core
import "primereact/resources/primereact.min.css";

import cinemap from "../assets/cinemap.svg";

export default function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const toast = useRef(null);
  const newUserNotification = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const newUser = queryParams.get("newUser");

  useEffect(() => {
    if (newUser && !newUserNotification.current) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Account created successfully",
        life: 6000,
      });
      newUserNotification.current = true;
    }
  }, [newUser]);

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill all the fields",
        life: 8000,
      });
    } else {
      setIsLoading(true);
      toast.current.clear();

      const values = {
        email,
        password,
      };

      console.log(values);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (data.error) {
        setIsLoading(false);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Invalid email or password",
          life: 8000,
        });
      } else {
        signIn({
          token: data.token,
          expiresIn: 3600,
          tokenType: "Bearer",
          authState: { token: data.token, expiresIn: 3600, tokenType: "Bearer" },
        });
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${data.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        });

        const dados = await response.json();
        if (dados.name) {
          localStorage.setItem("nomeTela", dados.name);
          localStorage.setItem("id", dados.id);
        }
        setIsLoading(false);
        navigate("/home?login=true");
      }
    }
  };
  return (
    <div className="flex h-full w-full flex-1 items-center flex-col justify-center px-6 py-12 lg:px-8 text-white">
      <Toast ref={toast} />
      {isLoading ? (
        <Loading />
      ) : (
        <div className="rounded-xl bg-primary-500 px-40 py-12 my-16">
          <div className="flex flex-col items-center justify-center sm:mx-auto sm:w-full sm:max-w-sm">
            <img className="mt-8 w-80" src={cinemap} alt="cinemap's logo"></img>
            <h2 className="mt-24 text-center text-4xl font-bold leading-9 tracking-tight">Sign in to your account</h2>
          </div>

          <form className="space-y-6 mt-16" action="#" method="POST">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="E-mail"
              className="block w-full rounded-xl border-0 py-5 px-4 text-white text-lg outline-none shadow-sm bg-primary-700"
            />

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              className="block w-full rounded-xl border-0 py-5 px-4 text-white text-lg outline-none shadow-sm bg-primary-700"
            />

            <div>
              <button
                type="submit"
                className="flex w-full text-center justify-center rounded-xl bg-primary-300 px-3 py-4 text-2xl font-semibold leading-6 text-white shadow-sm transition hover:brightness-105"
                onClick={handleLogin}
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xl text-white opacity-30">
            Don’t have an account?{" "}
            <Link to="/" className="underline">
              Create here
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
