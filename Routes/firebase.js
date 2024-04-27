const admin = require("firebase-admin");
const express = require("express");
const Router = express.Router();
const serviceAccount = require('../firebase/serviceAccountKeys.json');
const middle = require('../middleware/middle')
const isAdmin = require("../middleware/admin")



// Initialize Firebase Admin SDK


Router.post("/sendpopup",middle,isAdmin, async (req, res) => {
     
 const title = req.body.title
 const token = req.body.token
 try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
 } catch (error) {
  }
 
 
 try {
   
 let detail = req.body.detail

if (title === 'Processing') {
    detail = "We're excited to inform you that your order is currently being processed at TAVGUN BOUTIQUE. Our dedicated team is working diligently to ensure that everything is prepared and packaged with utmost care.";
} else if (title === 'Shipped') {
    detail = "Exciting news! We're thrilled to inform you that your order has been successfully shipped.";
} else if (title === 'Out for Delivery') {
    detail = "Your package is on its way and should be arriving shortly. Please ensure someone is available at the delivery address to receive the package.";
} else if (title === 'Delivered') {
    detail = "We're thrilled to inform you that your order has been successfully delivered!";
} else if (title === 'Cancelled') {
    detail = "We regret to inform you that your order with TAVGUN BOUTIQUE has been cancelled.";
}
 else if (title === 'Return Approved') {
    detail = "We're writing to inform you that your return request has been successfully approved.";
}
 else if (title === 'Return Rejected') {
    detail = "We regret to inform you that your return request has been rejected. Our team has reviewed the request and determined that it does not meet our return policy criteria.We understand this may be disappointing, and we want to ensure your satisfaction. Our customer support team will contact you shortly to discuss any further assistance you may require.";
}
 else if (title === 'Refund Initiated') {
    detail = "We wanted to inform you that the refund for your order has been initiated.The refund process may take a few business days to complete, depending on your payment method and financial institution. Please be patient as we work to ensure the refund is processed promptly.";
}
 else if (title === 'Return Completed') {
    detail = "We're pleased to inform you that your refund has been successfully processed";
}
        const message = {
            token: token,
            notification: {
                title: title,
                body: detail,
            },
           
        };

        // Send the message
        admin.messaging().send(message)
               
        res.json(message)
     } catch (error) {
          res.status(500).send("Internal server error");
    }
});


Router.get("/Privacy_Policy", async (req, res) => {
  
 let policy = `<View>  Privacy Policy
 This privacy policy applies to the Tavgunboutique app (hereby referred to as "Application") for mobile devices that was created by Tavgun (hereby referred to as "Service Provider") as a Free service. This service is intended for use "AS IS".
 
 
 Information Collection and Use
 The Application collects information when you download and use it. This information may include information such as
 
 Your device's Internet Protocol address (e.g. IP address)
 The pages of the Application that you visit, the time and date of your visit, the time spent on those pages
 The time spent on the Application
 The operating system you use on your mobile device
 
 The Application collects your device's location, which helps the Service Provider determine your approximate geographical location and make use of in below ways:
 
 Geolocation Services: The Service Provider utilizes location data to provide features such as personalized content, relevant recommendations, and location-based services.
 Analytics and Improvements: Aggregated and anonymized location data helps the Service Provider to analyze user behavior, identify trends, and improve the overall performance and functionality of the Application.
 Third-Party Services: Periodically, the Service Provider may transmit anonymized location data to external services. These services assist them in enhancing the Application and optimizing their offerings.
 
 The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.
 
 
 For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to email,phone number,user name,password,address. The information that the Service Provider request will be retained by them and used as described in this privacy policy.
 
 
 Third Party Access
 Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.
 
 
 Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:
 
 Google Play Services
 AdMob
 Facebook
 
 The Service Provider may disclose User Provided and Automatically Collected Information:
 
 as required by law, such as to comply with a subpoena, or similar legal process;
 when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;
 with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.
 
 Opt-Out Rights
 You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
 
 
 Data Retention Policy
 The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, please contact them at Tavgun.boutique@gmail.com and they will respond in a reasonable time.
 
 
 Children
 The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
 
 
 The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider discover that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider (Tavgun.boutique@gmail.com) so that they will be able to take the necessary actions.
 
 
 Security
 The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
 
 
 Changes
 This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
 
 
 This privacy policy is effective as of 2024-04-27
 
 
 Your Consent
 By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
 
 
 Contact Us
 If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at Tavgun.boutique@gmail.com.
 
 This privacy policy page was generated by App Privacy Policy Generator
 </View>`
               
        res.json(policy )
     
});













module.exports = Router;
 