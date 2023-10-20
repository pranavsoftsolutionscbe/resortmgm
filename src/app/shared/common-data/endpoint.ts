class EndpointList {
  /**
   * Category
   * @method GET [action]
   * @method POST [action]
   * @method  GET|PUT|DELETE [action]/CategoryId
   */
  readonly EcomCategory = "ecom_category";
  /**
   *
   * @method GET [action]/Cust_ID/EType
   */
  readonly ecomTypeDetails = "ecom_Type/ecom_TypeDetails";
  /**
   * Product Group by Cust_ID & CategoryID
   * @method GET [action]/Cust_ID
   */
  readonly GeteComProductGroup = "ecom_Group/GeteComProductGroup";
  /**
   * Product Master
   * @method GET [action]
   * @method POST [action]
   * @method  GET|PUT|DELETE [action]/ProductCode
   */
  readonly ProductMasters = "productmasters";
  readonly GetManufacture = "productmasters/GetManufacturerName";
  /**
   * Product List by Cust_ID & CategoryId & ParentGroupId
   * @method GET [action]/Cust_ID/CategoryId/ParentGroupId/ImageType/EType/CurrencyI/RateID
   */
  readonly eComProductDetails = "ecom_Product/eComProductDetails";
  /**
   * Product UOM details by Cust_ID & EProductCode & CurrencyID & RateId
   * @method GET [action]/Cust_ID/EProductCode/CurrencyID/RateId
   */
  readonly eComProductUOMRate = "ecom_Product/eComProductUOMRate";
  /**
   * Product details by Cust_ID & ProductCode
   * @method GET [action]/Cust_ID/ProductCode
   */
  readonly GetProductDetailList = "productdetails/GetProductDetailList";
  /**
   * Product Image Details by Cust_ID & ProductCode & ImageType
   * @method GET [action]/Cust_ID/ProductCode/ImageType
   */
  readonly GeteProductImagesDetails = "ProductImages/GeteProductImagesDetails";
  /**
   *
   * @method GET [action]/Cust_Id/ProductCode/ImageType/EType/CurrencyID/RateId
   */
  readonly GetecomProductAssessoriesDetails =
    "ecom_ProductAssessories/Getecom_ProductAssessoriesDetails";
  /**
   * Currency master by Cust_ID
   * @method GET [action]/Cust_ID
   */
  readonly GetActiveCurrency = "Currencymasters/GetActiveCurrency";
  /**
   *
   * @method GET|PUT|DELETE [action]/PTHAutoID
   */
  readonly ProductTransactionHeads = "ProductTransactionHeads";
  readonly YourOrderDetails =
    "ProductTransactionHeads/GetCustomerWiseSalesOrderPending";
  /**
   *
   * @method GET|PUT|DELETE [action]/PTDAutoID
   */
  readonly ProductTransactionDetails = "ProductTransactionDetails";
  /**
   *
   * @method POST [action]
   */
  readonly PostProductTransactionDetails =
    "ProductTransactionDetails/PostProductTransactionDetails";
  /**
   *
   * @method GET [action]/Cust_ID/DocumentTypeName/LocationID/EntryDate
   */
  readonly GetDoumentTypeID = "DocumentTypes/GetDoumentTypeID";
  /**
   *
   * @method GET [action]/Cust_ID/AutoNo
   */
  readonly GetNextVoucherNo = "DocumentTypes/GetNextVoucherNo";
  /**
   *
   * @method GET [action]/AutoNo
   */
  readonly updateVoucherNo = "DocumentTypes/updateVoucherNo";
  /**
   *
   */
  readonly CashFreePayment = "ecom_Payment/CashFree_Payment";
  /**
   *
   */
  readonly CashFreePaymentrequiest = "ecom_Payment/CashFree_Paymentrequiest";
  /**
   *
   */
  readonly PartyMasters = "PartyMasters";
  /**
   *
   */
  readonly PartyAddressMasters = "PartyAddressMasters";
  /**
   *
   */
  readonly countryMastersList = "countrymasters/countryMastersList";
  /**
   *
   */
  readonly GetPartyAddress = "PartyAddressMasters/GetPartyAddress";
  /**
   *
   */
  readonly GetUserauthentication = "PartyMasters/GetUserauthentication";
  // get brand for shop page
  readonly GetBrand = "ecom_Brand/ecom_BrandDetails";
  readonly GetBrandProduct = "ecom_ProductBrand/ecom_ProductBrandList";
  /**
   *
   */
  readonly ecomCartWishList = "ecom_CartWishList";
  readonly GetAddressDetails = "querydata/GetAddressDetails";
  readonly GetEmailCheck = "PartyMasters/GetEmailCheck";
  readonly GetMobileNoCheck = "PartyMasters/GetMobileNoCheck";
  readonly gpsNotification = "gps_Notification";
  readonly SendEmail = "SendEmail";
}

class CashFreeEndpointList {
  readonly Order = "order/create";
}

export const Endpoint = new EndpointList();

export const CashFreeEndpoint = new CashFreeEndpointList();
