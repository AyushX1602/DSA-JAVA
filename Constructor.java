public class Constructor {

   public static class car{
    int seats;
    String color;
    double length;
    // car(){//default constructor
    //     seats = 4;
    //     color = "Red";
    //     length = 4.5;

    // }

    car (int s, String c, double l){ //parameterized constructor
        seats = s;
        color = c;
        length = l;
    }
  
   void print(){
    System.out.println("seats: "+seats+", color: "+color+", length: "+length);
   }
   }
public static void main(String[] args) {
    // car c1 = new car();
    car c2 = new car(5, "Blue", 4.8);
    c2.print();
}
}