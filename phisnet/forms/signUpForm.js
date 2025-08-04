import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUser,
  faEnvelope,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGoogle,
  faFacebookF,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
const SignUpForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md flex flex-col">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2 className="text-2xl font-bold mb-2 text-center">Sign up</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Learn on your own time from top universities and businesses.
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className="w-full border rounded-md px-3 py-2 text-sm pl-9"
                required
              />
              <FontAwesomeIcon
                icon={faUser}
                className="absolute left-3 top-2.5 text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="name@email.com"
                className="w-full border rounded-md px-3 py-2 text-sm pl-9"
                required
              />
              <FontAwesomeIcon
                icon={faEnvelope}
                className="absolute left-3 top-2.5 text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Create password"
                minLength="8"
                maxLength="72"
                className="w-full border rounded-md px-3 py-2 text-sm pl-9"
                required
              />
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-2.5 text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-orange-600  text-white py-2 rounded-md font-semibold"
          >
            Join for Free
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
            Log in
          </a>
        </p>
        <p className="text-center text-sm mt-1">
          <a href="#" className="text-blue-600 hover:underline">
            Sign up with your organization
          </a>
        </p>

        <p className="text-[11px] text-gray-500 text-center mt-4 leading-snug">
          I accept PhishNet’s{" "}
          <a href="#" className="text-blue-600">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600">
            Privacy Notice
          </a>
          .<br />
          Having trouble logging in?{" "}
          <a href="#" className="text-blue-600">
            Learner help center
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
