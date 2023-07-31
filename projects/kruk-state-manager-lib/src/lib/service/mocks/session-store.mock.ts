export class SessionStorageMock {
  sessionStorageData = {} as { [key: string]: string };

  getItem = (key: string) => {
    return key in this.sessionStorageData ? this.sessionStorageData[key] : null;
  };

  setItem = (key: string, value: string) => {
    this.sessionStorageData[key] = value;
  };

  clear = () => {
    this.sessionStorageData = {};
  };
}
