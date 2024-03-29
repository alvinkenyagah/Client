import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./editclient.css";





export default function EditTransaction() {


  const [updatedInsuranceCompany, setUpdatedInsuranceCompany] = useState("");


  const [insuranceCompanies, setInsuranceCompanies] = useState([]);

  

useEffect(() => {
  const fetchInsuranceCompanies = async () => {
    try {
      const insuranceCompaniesUrl = "https://insurancetestdatabase.vercel.app/insurance_companies";
      const insuranceCompaniesResponse = await fetch(insuranceCompaniesUrl);

      if (!insuranceCompaniesResponse.ok) {
        throw new Error("Failed to fetch insurance companies");
      }

      const insuranceCompaniesData = await insuranceCompaniesResponse.json();
      setInsuranceCompanies(insuranceCompaniesData);
    } catch (error) {
      console.error(error);
    }
  };

  fetchInsuranceCompanies();
}, []);




  const navigate = useNavigate()
  const [clientDetails, setClientDetails] = useState({});


  const { id } = useParams();
  const [transaction, setTransaction] = useState({});
  const [editedTransaction, setEditedTransaction] = useState({
    client_id: "",
    policyno: "",
    reg: "",
    start: "",
    expire: "",
    company:"",
    classification: "",
    premium:"",
  });

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        // Fetch transaction details
        const transactionUrl = `https://insurancetestdatabase.vercel.app/transactions/${id}`;
        const transactionResponse = await fetch(transactionUrl, {
          method: "GET",
          headers: { "content-type": "application/json" },
        });
  
        if (!transactionResponse.ok) {
          throw new Error("Failed to fetch transaction details");
        }
  
        const transactionData = await transactionResponse.json();
        setTransaction(transactionData);
  
        setEditedTransaction({
          client_id: transactionData.client_id,
          policyno: transactionData.policyno,
          reg: transactionData.reg,
          premium: parseInt(transactionData.premium, 10),
          start: transactionData.start,
          expire: transactionData.expire,
          classification: transactionData.classification,
        });
  
        // Fetch client details
        const clientUrl = `https://insurancetestdatabase.vercel.app/clients/${transactionData.client_id}`;
        const clientResponse = await fetch(clientUrl, {
          method: "GET",
          headers: { "content-type": "application/json" },
        });
  
        if (!clientResponse.ok) {
          throw new Error("Failed to fetch client details");
        }
  
        const clientData = await clientResponse.json();
        setClientDetails(clientData);
  
        // Set the initial value of updatedInsuranceCompany
        setUpdatedInsuranceCompany(clientData.company_id || ""); // Assuming company_id is a string
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchClientDetails();
  }, [id]);
  


  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // If the input field is "policyno", "reg", or "classification", convert the value to uppercase
    const updatedValue =
      (name === "policyno" || name === "reg" || name === "classification")
        ? value.toUpperCase()
        : name === "premium"
        ? parseInt(value, 10)
        : name === "company_id" // add this condition for the insurance company
        ? parseInt(value, 10)  // convert value to a number
        : value;
  
    // Update the company_id directly in the editedTransaction state only if it's not the select input
    if (name !== "company_id") {
      setEditedTransaction((prevTransaction) => ({
        ...prevTransaction,
        [name]: updatedValue,
        premium: name === "premium" ? parseInt(value, 10) : prevTransaction.premium,
        classification: name === "classification" ? value.toUpperCase() : prevTransaction.classification,
        company_id: name === "company_id" ? parseInt(value, 10) : prevTransaction.company_id,
      }));
    } else {
      // Handle the case when the change comes from the select input
      setUpdatedInsuranceCompany(parseInt(value, 10));
    }
  };
  
  
  

  const handleSaveChanges = async () => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Update',
        text: 'Are you sure you want to save changes?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!',
        cancelButtonText: 'Cancel',
      });
  
      if (result.isConfirmed) {
        // User clicked "Yes, save it!" button
  
        // Include the updated insurance company ID in the editedTransaction object
        const updatedTransaction = {
          ...editedTransaction,
          company_id: updatedInsuranceCompany,
        };
  
        const url = `https://insurancetestdatabase.vercel.app/transactions/${id}`;
        const response = await fetch(url, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(updatedTransaction),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update transaction details");
        }
  
        // Show SweetAlert success confirmation
        await Swal.fire({
          icon: "success",
          title: "Transaction details updated successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
  
        // Fetch updated transaction details immediately after saving
        const updatedResponse = await fetch(`https://insurancetestdatabase.vercel.app/transactions/${id}`, {
          method: "GET",
          headers: { "content-type": "application/json" },
        });
  
        if (!updatedResponse.ok) {
          throw new Error("Failed to fetch updated transaction details");
        }
  
        const updatedData = await updatedResponse.json();
        setTransaction(updatedData);
  
      } else {
        // User clicked "Cancel" or closed the modal
        Swal.fire('Cancelled', 'Your changes have not been saved.', 'info');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  
  

  const handleDeleteTransaction = () => {
    // Show SweetAlert confirmation for delete
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this Policy!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `https://insurancetestdatabase.vercel.app/transactions/${id}`;
          const response = await fetch(url, {
            method: "DELETE",
            headers: { "content-type": "application/json" },
          });

          if (!response.ok) {
            throw new Error("Failed to delete transaction");
          }

          // Show SweetAlert confirmation for delete success
          Swal.fire({
            icon: "success",
            title: "Policy deleted successfully!",
            showConfirmButton: false,
            timer: 1500 ,
          });

          // Navigate back to the transactions page
          navigate("/motor");

        } catch (error) {
          console.error(error);
        }
      }
    });
  }



  const calculateDaysLeft = (start, expire) => {
    const currentDate = new Date();
    const startDate = new Date(start);
    const expireDate = new Date(expire);

    startDate.setHours(23, 59, 59, 999);
    expireDate.setHours(23, 59, 59, 999);

    const remainingDays = Math.floor((expireDate - currentDate) / (1000 * 60 * 60 * 24));
    return remainingDays >= 0 ? remainingDays : 0;
  };

 

  return (
    <>
    <h1 className="font-bold text-4xl">Edit transaction info</h1>
    
    <div className="flex-container">
    
      {/* CLIENT DETAILS */}


      <div className="flex-item" id="div1">
      <h2 className="font-bold text-3xl underline py-2">Policy  Information</h2>
      <ul style={{listStyle:"none"}}>
  
      <li className="text-xl">
      <strong>Name:</strong> {clientDetails.name} {/* Updated line */}
      </li>

        <li className="text-xl">
          <strong>Policy:</strong> {transaction.policyno}
        </li>
        <li className="text-xl">
          <strong>Registration:</strong> {transaction.reg}
        </li>

          {/* INSURANCE COMPANY */}
          
          <li className="text-xl">
            <strong>Insurance company:</strong>{" "}
            {insuranceCompanies.find((company) => company.id === transaction.company_id)?.company}
          </li>


        <li className="text-xl">
          <strong>Classification:</strong> {transaction.classification}
        </li>
        <li className="text-xl">
          <strong>Premium:</strong> {transaction.premium}
        </li>
        <li className="text-xl">
          <strong>Start Date:</strong> {transaction.start}
        </li>
        <li className="text-xl">
          <strong>Expire Date:</strong> {transaction.expire}
        </li>

        <li className="text-xl"><strong>Days left: </strong> <em style={{ color: calculateDaysLeft(transaction.start, transaction.expire) > 0 ? 'black' : 'red'}}>{calculateDaysLeft(transaction.start, transaction.expire)}</em> days left</li>

      </ul>
    </div>

      {/* Insurance company cost breakdown */}

      <div className="flex-item" id="div1">
      <h2 className="font-bold text-3xl underline mb-2">Premium breakdown</h2>
        </div>



      {/* UPDATE FORM */}
      <div className="flex-item" id="div1">    
      <form className="update-transaction">
        <h2 className="font-bold text-3xl underline mb-3">Update Policy</h2>

        <div className="flex items-center mb-1">
            <label className="mr-2 text-xl">
              Policy:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="policyno"
              placeholder="Update policy number"
              onChange={handleInputChange}
            />
        </div>

        <div className="flex items-center py-1">
            <label className="mr-2 text-xl">
          Registration:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            name="reg"
            placeholder="Update registration"
            onChange={handleInputChange}
          />
        </div>


        <div className="flex items-center py-1">
          <label className="mr-2 text-xl">Company:</label>
          <select
                name='company_id'
                value={updatedInsuranceCompany}
                onChange={(e) => setUpdatedInsuranceCompany(parseInt(e.target.value, 10))}
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="" disabled>
                  Select Insurance Company
                </option>
                {insuranceCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company}
                  </option>
                ))}
           </select>

        </div>

        

        <div className="flex items-center py-1">
            <label className="mr-2 text-xl">
				    Classification:
              </label>
            <select
              value={editedTransaction.classification}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  classification: e.target.value,
                })
              }
              required
            >
              <option value="" disabled>
                Select Classification
              </option>
              <optgroup label="Comprehensive">
              <option value="Comprehensive Private">Comprehensive Private</option>
			        <option value="Comprehensive Commercial">Comprehensive Commercial</option>
              <option value="Comprehensive PSV">Comprehensive P.S.V</option>
              <option value="Comprehensive TSV">Comprehensive T.S.V</option>
              <option value="Comprehensive Special MV">Comprehensive Special M.V</option>
              <option value="Comprehensive Trailer">Comprehensive Trailer</option>
              </optgroup>
              <optgroup label="T.P.O">
              <option value="T.P.O Private">T.P.O Private</option>
              <option value="T.P.O Commercial">T.P.O Commercial</option>
              <option value="T.P.O PSV">T.P.O P.S.V</option>
              <option value="T.P.O TSV">T.P.O T.S.V</option>
              <option value="T.P.O Special MV">T.P.O Special M.V</option>
              <option value="T.P.O Trailer">T.P.O Trailer</option>
              </optgroup>  
            </select>            
        </div>

        <div className="flex items-center mb-1">
            <label className="mr-2 text-xl">
              Premium:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              name="premium"
              placeholder="Update premium amount"
              onChange={handleInputChange}
            />
        </div>

        <div className="flex items-center py-1">
            <label className="mr-2 text-xl">    
        Start_Date:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="date"
            name="start"
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center py-1">
            <label className="mr-2 text-xl">
          Expire:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="date"
            name="expire"
            onChange={handleInputChange}
          />
        </div>
        
        <button type="button"
        onClick={handleSaveChanges}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded mt-2 mb-3"
        
        >
          Save Changes
        </button>

        <button
            type="button"
            onClick={handleDeleteTransaction}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
            >
              Delete Policy
        </button>

      </form>
      </div>



    </div>
    <div className="flex items-center justify-center">
        <button onClick={() => navigate(`/motor`)} className="view-more-button">
          Back
        </button>
    </div>

    </>

  );
}
