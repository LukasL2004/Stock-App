import { useEffect, useState } from "react";
import WalletService from "../../Services/WalletService";

export default function Profile() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("You are not logged in");
        }
        const response = await WalletService.Balance(token);
        setBalance(response.balance);
      } catch (error) {
        console.log(error);
        setError("something doesn t work");
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile">
      <div className="profileHeader">
        <div className="profilePic">
          <img src="" alt="" />
        </div>
        <h2 className="username"></h2>
      </div>
      <div className="statBox">
        <div className="addFounds">+</div>
        <div className="balance">{balance}</div>
      </div>
      <div className="statBox"></div>
    </div>
  );
}
