import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  faGoogle,
  faFacebookF,
  faApple,
} from "@fortawesome/free-brands-svg-icons";

const LoginForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md flex flex-col">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">Welcome back</h2>

        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              placeholder="example@email.com"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                placeholder="********"
                className="w-full border rounded-md px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <FontAwesomeIcon
                icon={faEye}
                className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              />
            </div>
            <a
              href="#"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="bg-orange-600  text-white py-2 rounded-md font-semibold"
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-4 text-sm text-gray-500">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="flex flex-col gap-2">
          <button className="flex items-center justify-center border rounded-md py-2 text-sm text-gray-700 hover:bg-gray-100">
            <FontAwesomeIcon icon={faGoogle} className="mr-2" />
            Continue with Google
          </button>
          <button className="flex items-center justify-center border rounded-md py-2 text-sm text-blue-600 hover:bg-gray-100">
            <FontAwesomeIcon icon={faFacebookF} className="mr-2" />
            Continue with Facebook
          </button>
          <button className="flex items-center justify-center border rounded-md py-2 text-sm text-black hover:bg-gray-100">
            <FontAwesomeIcon icon={faApple} className="mr-2" />
            Continue with Apple
          </button>
        </div>

        <p className="text-center text-sm mt-4">
          <a href="#" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
        <p className="text-center text-sm mt-1">
          <a href="#" className="text-blue-600 hover:underline">
            Log in with your organization
          </a>
        </p>

        <p className="text-[11px] text-gray-500 text-center mt-4 leading-snug">
          Having trouble logging in?{" "}
          <a href="#" className="text-blue-600">
            Learner help center
          </a>
        </p>
        <p className="text-[11px] text-gray-400 text-center mt-1 leading-snug">
          This site is protected by reCAPTCHA Enterprise and the Google
          <a href="#" className="text-blue-600">
            {" "}
            Privacy Policy{" "}
          </a>{" "}
          and
          <a href="#" className="text-blue-600">
            {" "}
            Terms of Service
          </a>{" "}
          apply.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
