const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			token: JSON.parse(localStorage.getItem("token")) || []
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: () => {
				// fetching data from the backend
				fetch(process.env.BACKEND_URL + "/api/hello")
					.then(resp => resp.json())
					.then(data => setStore({ message: data.message }))
					.catch(error => console.log("Error loading message from backend", error));
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			},
			getActiveUser: async email => {
				try {
					const res = await fetch(`${process.env.BACKEND_URL}/user/active`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ email })
					});
					const activeUser = await res.json();
					setStore({ activeUser: activeUser.first_name });
					localStorage.setItem("activeUser", activeUser.first_name);
				} catch (error) {
					throw Error("Wrong email or password");
				}
			},
			login: async (email, password, history) => {
				try {
					const res = await fetch(`${process.env.BACKEND_URL}/login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ email, password })
					});
					if (res.ok) {
						const token = await res.json();
						localStorage.setItem("token", JSON.stringify(token));
						console.log("The response is ok", res);
						getActions().getActiveUser(email);
						history.push("/profile");

						return true;
					} else {
						throw "Something went wrong";
					}
				} catch (error) {
					throw Error("Wrong email or password");
				}
			},
			signup: async (email, password, first_name, last_name, setMessageState) => {
				console.log("I am the signup function");
				console.log(first_name);

				try {
					const res = await fetch(`${process.env.BACKEND_URL}/user`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ email, password, first_name, last_name, date })
					});
					if (res.ok) {
						const token = await res.json();

						// localStorage.setItem("first_name", JSON.stringify(first_name));
						localStorage.setItem("token", JSON.stringify(token));
						console.log("The response is ok", res);
						getActions().getActiveUser(email);

						return true;
					} else {
						throw "Something went wrong";
					}
				} catch (error) {
					throw Error("Something went wrong");
				}
			}
		}
	};
};

export default getState;
