import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState("");
  const [user_data, setUser_data] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        localStorage.setItem("isLoggedIn", currentUser.accessToken);
        setUser(currentUser);
        loadProfile(currentUser.uid);
      } else localStorage.removeItem("isLoggedIn");
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const createUser = async (email, password, user_data_) => {
    return createUserWithEmailAndPassword(auth, email, password).then(
      async (user) => {
        try {
          const docRef = doc(db, "users", String(user.user.uid));
          await setDoc(docRef, {
            registration_date: String(Date.now()),
            ...user_data_,
          });
        } catch (e) {
          console.log(e);
        }
      }
    );
  };

  const loadProfile = async (uid) => {
    const docRef = doc(db, "users", String(uid));
    setUser_data((await getDoc(docRef)).data());
  };

  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password).then();
  };

  const updateProfile = async (user_data_) => {
    try {
      const docRef = doc(db, "users", String(user.uid));
      await updateDoc(docRef, user_data_).then(() => {
        setUser(user_data_);
        console.log("Update done");
        toast.success("Profile Update Successful");
      });
    } catch (e) {
      console.log(e);
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const createOrder = async (order_data_, ID) => {
    let buyerWallet;

    try {
      const Ref = collection(db, "users");
      let q = query(Ref, where("Email", "==", order_data_["Buyer Email"]));
      let res = await getDocs(q);
      res.forEach((doc) => (buyerWallet = doc.data()["Wallet Address"]));
    } catch (e) {
      console.log(e);
    }

    if (buyerWallet)
      try {
        const docRef = doc(db, "orders", ID);
        await setDoc(docRef, {
          ...order_data_,
          user: user.uid,
          "Escrow Paid": "No",
          "Escrow Tx": "",
          "Escrow Amount": "0",
          id: ID,
          seller: user.email,
          "Buyer Wallet": buyerWallet,
          "Seller Wallet": user_data["Wallet Address"],
          progress: {
            status: 10,
            stages: {
              "Order Created": new Date(+ID).toLocaleString(), //10%
              "Devices Serials Seller": "Incomplete", //15%
              "Escrow Paid": "Incomplete", //15%
              "Devices Serials Buyer": "Incomplete", //15%
              "Admin Confirmation": "Incomplete", //15%
              "Buyer Claimed Escrow": "Incomplete", //15%
              "Seller Withdrawn Escrow": "Incomplete", //15%
            },
          },
        }).then(() => {
          console.log("Order added");
          toast.success("Order added");
          navigate("/dashboard/swap-details?id=" + ID);
        });
      } catch (e) {
        console.log(e);
      }
    else {
      toast.error("Buyer with given email not found");
      return false;
    }
  };

  const isLoggedIn = () => {
    return localStorage.getItem("isLoggedIn") ? true : false;
  };

  return (
    <UserContext.Provider
      value={{
        createUser,
        user,
        user_data,
        logout,
        signIn,
        isLoggedIn,
        updateProfile,
        createOrder,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(UserContext);
};
