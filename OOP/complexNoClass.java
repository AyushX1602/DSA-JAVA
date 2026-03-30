class complexNumber {
    int x;
    int y;

     complexNumber(int x, int y) {
        this.x = x;
        this.y = y;
    }
    void print(){
        if(y>=0)System.out.println(x+" + "+y+"i");
        else System.out.println(x+" - "+(-y)+"i");
    }

    void add(complexNumber c){
        x += c.x;
        y+= c.y;
        System.out.println("After addition: ");
        
    }

    void multiply (complexNumber c) {
        x = x*c.x - y*c.y;
        y = x*c.y + y*c.x;
        System.out.println("After multiplication: ");
       
    }

    void divide (complexNumber c) {
        x = (x*c.x + y*c.y) / (c.x * c.x + c.y*c.y);
        y = (y*c.x - x*c.y) / (c.x * c.x + c.y*c.y);
        System.out.println("After division: ");
        
    }

}


public class complexNoClass {
    public static void main(String[] args) {
        complexNumber c1 =new complexNumber(2,-5);
        complexNumber c2 =new complexNumber(3,4);
        c1.print();
        c2.print();

        c1.add(c2);
        c1.print(); c2.print();
        c1.multiply(c2);
        c1.print(); c2.print();
        c1.divide(c2);
        c1.print(); c2.print();
    }
}
