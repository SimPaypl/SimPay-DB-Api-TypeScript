import { SHA256 } from 'crypto-ts';

interface ProviderList {
    [id: number]: number[];
}

const Providers: ProviderList = {
    // Orange
    1: [ 0.65, 0.65, 0.65 ],

    // Play
    2: [ 0.55, 0.65, 0.70 ],

    // T-Mobile
    3: [ 0.60, 0.60, 0.60 ],

    // Plus
    4: [ 0.50, 0.50, 0.50 ]
};

const RequiredFieldsParse = [
    'id', 'status', 'valuenet', 'sign'
];

export class SimPay {
    private errorCode = 0;
    private apiKey = '';
    private status = '';
    private value = 0;
    private valueGross = 0;
    private control = '';
    private transId = '';
    private valuePartner = 0;
    private userNumber = '';

    public Parse(data: any): boolean {
        for (const field of RequiredFieldsParse) {
            if (data[field] === undefined) {
                return this.SetError(1);
            }
        }

        this.transId = data.id;
        this.status = data.status;
        this.value = Number(data.valuenet);
        this.valueGross = data.valuenet_gross;
        this.valuePartner = Number(data.valuepartner);

        if (data.control) {
            this.control = data.control;
        }

        if (data.number_from) {
            this.userNumber = data.number_from;
        }

        if (data.value <= 0 || this.valuePartner) {
            return this.SetError(4);
        }

        const hash = this.transId + this.status + data.valuenet + data.valuepartner + this.control + this.apiKey

        if (SHA256( hash ).toString() !== data.sign) {
            return this.SetError(3);
        }

        return true;
    }

    public IsError(): boolean {
        return this.errorCode !== 0;
    }

    public GetErrorText(): string {
        switch (this.errorCode) {
            case 0:
                return 'No error';

            case 1:
                return 'Missing parameters';

            case 2:
                return 'No sign param';

            case 3:
                return 'Wrong sign';

            case 4:
                return 'Wrong amount value';
        }

        return 'Unknown error';
    }

    private SetError(errorCode: number): boolean {
        this.errorCode = errorCode;

        return false;
    }

    public SetAPIKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    public GetStatus(): string {
        return this.status;
    }

    public GetValue(): number {
        return this.value;
    }

    public GetValueGross(): number {
        return this.valueGross;
    }

    public GetControl(): string {
        return this.control;
    }

    public IsTransactionPaid(): boolean {
        return this.status === 'ORDER_PAYED';
    }

    public GetTransactionID(): string {
        return this.transId;
    }

    public TransactionOK(): string {
        return 'OK';
    }

    public GetValuePartner(): number {
        return this.valuePartner;
    }

    public GetUserNumber(): string {
        return this.userNumber;
    }

    public GetRewardPartner(amount: number, provider: number): number {
        if (amount <= 0) {
            return 0;
        }

        if (!Providers[provider]) {
            return 0;
        }

        if (amount < 9) {
            return Providers[provider][0];
        } else if (amount < 25) {
            return Providers[provider][1];
        } else {
            return Providers[provider][2];
        }
    }
}