class Fraction {
    int num;
    int den;
    
    Fraction(int num,int den){
        this.num = num;
        this.den = den;
        simplify();
    }
    void print(){
        System.out.println(num+"/"+den);
    }
    void add(Fraction f){
        num = num*f.den + f.num*den;
        den = den*f.den;
        System.out.println("After addition: ");
        simplify();
    }
    void multiply(Fraction f){
        num = num*f.num;
        den = den*f.den;
        System.out.println("After multiplication: ");
        simplify();
    }
    void divide(Fraction f){
        num = num*f.den;
        den = den*f.num;
        System.out.println("After division: ");
        simplify();
    }
    void simplify(){
        int gcd = hcf(num,den);
        num /= gcd;
        den /= gcd;
    }
    int hcf(int a,int b){
        if(b==0)return a;
        return hcf(b,a%b);
    }
}

public class FractionNo {
    public static void main(String[] args) {
        Fraction f1 = new Fraction(1,2);
        Fraction f2 = new Fraction(3,4);
        f1.print();
        f2.print();
        f1.add(f2);
        f1.print();
        f1.multiply(f2);
        f1.print();
        f1.divide(f2);
        f1.print();
    }
}

